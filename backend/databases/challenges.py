from datetime import datetime, timezone
import uuid
from typing import List, Literal, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from databases.session import get_db
from databases.schema.models import DoctorChallenge, Doctor, User
from app.auth import get_current_user_claims, UserClaims

router = APIRouter(tags=["challenges"])


# --- Schemas ---

class ChallengeSubmission(BaseModel):
    challenge: str = Field(..., min_length=5, max_length=5000, description="Workflow challenge description")
    doctor_name: Optional[str] = None
    doctor_email: Optional[str] = None
    doctor_phone: Optional[str] = None


class ChallengeRecord(BaseModel):
    id: str
    doctor_id: Optional[str] = None
    doctor_name: str
    doctor_email: str
    doctor_phone: Optional[str] = None
    license_number: Optional[str] = None
    challenge: str
    status: str
    admin_notes: Optional[str] = None
    created_at: str
    updated_at: str


class ChallengeStats(BaseModel):
    total: int
    new_count: int
    in_review_count: int
    planned_count: int
    resolved_count: int


class ChallengeListResponse(BaseModel):
    items: List[ChallengeRecord]
    total: int
    stats: ChallengeStats


class ChallengeStatusUpdateRequest(BaseModel):
    status: Literal["New", "In Review", "Planned", "Resolved"]
    admin_notes: Optional[str] = None


def format_challenge_record(item: DoctorChallenge) -> ChallengeRecord:
    return ChallengeRecord(
        id=item.id,
        doctor_id=item.doctor_id,
        doctor_name=item.doctor_name,
        doctor_email=item.doctor_email,
        doctor_phone=item.doctor_phone,
        license_number=item.license_number,
        challenge=item.challenge,
        status=item.status,
        admin_notes=item.admin_notes,
        created_at=item.created_at.isoformat() if item.created_at else "",
        updated_at=item.updated_at.isoformat() if item.updated_at else "",
    )


# --- Endpoints ---

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Submit a doctor workflow challenge",
    description="Endpoint for practitioners to share operational or clinical workflow bottlenecks."
)
def submit_challenge(
    payload: ChallengeSubmission,
    db: Session = Depends(get_db),
    claims: Optional[UserClaims] = Depends(lambda: None), # Optional auth or caller info
):
    clean_challenge = payload.challenge.strip()
    if len(clean_challenge) < 5:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide a challenge description with at least 5 characters."
        )

    doc_id = None
    doc_name = (payload.doctor_name or "").strip() or "Practitioner"
    doc_email = (payload.doctor_email or "").strip().lower() or "doctor@meyveda.com"
    doc_phone = (payload.doctor_phone or "").strip() or None
    lic_num = None

    # If email is provided, check if matching doctor exists in database
    if doc_email and doc_email != "doctor@meyveda.com":
        doctor_row = (
            db.query(Doctor)
            .join(User, Doctor.user_id == User.id)
            .filter(func.lower(User.email) == doc_email)
            .first()
        )
        if doctor_row:
            doc_id = doctor_row.id
            if not doc_name or doc_name == "Practitioner":
                doc_name = doctor_row.full_name
            if not doc_phone:
                doc_phone = doctor_row.phone
            lic_num = doctor_row.medical_license_number

    record = DoctorChallenge(
        id=str(uuid.uuid4()),
        doctor_id=doc_id,
        doctor_name=doc_name,
        doctor_email=doc_email,
        doctor_phone=doc_phone,
        license_number=lic_num,
        challenge=clean_challenge,
        status="New",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return format_challenge_record(record)


@router.get(
    "/admin/list",
    response_model=ChallengeListResponse,
    summary="Admin: List all practitioner challenges",
)
def list_challenges_admin(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(DoctorChallenge)

    if status_filter and status_filter.strip().lower() != "all":
        query = query.filter(DoctorChallenge.status.ilike(status_filter.strip()))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                DoctorChallenge.doctor_name.ilike(term),
                DoctorChallenge.doctor_email.ilike(term),
                DoctorChallenge.challenge.ilike(term),
                DoctorChallenge.license_number.ilike(term),
            )
        )

    total = query.count()
    records = query.order_by(DoctorChallenge.created_at.desc()).offset(offset).limit(limit).all()

    all_q = db.query(DoctorChallenge)
    new_count = all_q.filter(DoctorChallenge.status == "New").count()
    in_review_count = all_q.filter(DoctorChallenge.status == "In Review").count()
    planned_count = all_q.filter(DoctorChallenge.status == "Planned").count()
    resolved_count = all_q.filter(DoctorChallenge.status == "Resolved").count()

    stats = ChallengeStats(
        total=all_q.count(),
        new_count=new_count,
        in_review_count=in_review_count,
        planned_count=planned_count,
        resolved_count=resolved_count,
    )

    return ChallengeListResponse(
        items=[format_challenge_record(r) for r in records],
        total=total,
        stats=stats,
    )


@router.patch(
    "/admin/{challenge_id}/status",
    response_model=ChallengeRecord,
    summary="Admin: Update challenge status and notes",
)
def update_challenge_status(
    challenge_id: str,
    payload: ChallengeStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    record = db.query(DoctorChallenge).filter(DoctorChallenge.id == challenge_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor challenge record not found."
        )

    record.status = payload.status
    if payload.admin_notes is not None:
        record.admin_notes = payload.admin_notes.strip()
    record.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(record)

    return format_challenge_record(record)

