import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func

from databases.session import get_db
from databases.schema.models import ClinicalSurvey, ClinicalSurveyResponse, Doctor, User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/surveys", tags=["surveys"])

# Pydantic Schemas for Survey Builder (Google Form Style)
class SurveyQuestionOption(BaseModel):
    id: str
    text: str

class SurveyQuestion(BaseModel):
    id: str
    title: str
    type: str # 'radio', 'checkbox', 'rating', 'text'
    options: List[str] = Field(default_factory=list)
    required: bool = True
    helpText: Optional[str] = None

class SurveyCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=5)
    category: str = Field(default="AYUSH Clinical Practice")
    reward_points: int = Field(default=50, ge=10, le=500)
    status: str = Field(default="active")
    questions: List[SurveyQuestion] = Field(..., min_items=1)

class SurveyUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    reward_points: Optional[int] = None
    status: Optional[str] = None
    questions: Optional[List[SurveyQuestion]] = None

class SurveySubmitRequest(BaseModel):
    survey_id: str
    doctor_email: Optional[str] = None
    doctor_name: Optional[str] = None
    answers: Dict[str, Any] # question_id -> response

# Default seed survey questions for AYUSH clinical practice
DEFAULT_AYUSH_SURVEY_QUESTIONS = [
    {
        "id": "q1",
        "title": "Which clinical software capability would accelerate your daily AYUSH practice the most?",
        "type": "radio",
        "options": [
            "Centralized Samhita & Classical Verse RAG Clinical Support",
            "Zero-Inventory Medicine Sourcing & Last-Mile Delivery",
            "Digital Prakriti & Patient Lifecycle Subscriptions",
            "Multi-Clinic Smart Time Sharing & HFR Registry Sync"
        ],
        "required": True,
        "helpText": "Select the foundational pillar that solves your biggest bottleneck."
    },
    {
        "id": "q2",
        "title": "What challenges do you face in sourcing authentic classical formulations?",
        "type": "checkbox",
        "options": [
            "Lack of batch-level COA & heavy metal safety reports",
            "High minimum order quantities (MOQ) from GMP manufacturers",
            "Frequent stockouts of classical rasaushadhis / tailas",
            "Delivery delays to tier-2 and tier-3 patient locations"
        ],
        "required": True,
        "helpText": "Select all that apply in your clinical experience."
    },
    {
        "id": "q3",
        "title": "Rate the importance of Cashless Health Claims (NHCX / ABHA) for your clinic:",
        "type": "rating",
        "options": ["1 - Low Priority", "2 - Moderate", "3 - High Priority", "4 - Critical Game-Changer"],
        "required": True,
        "helpText": "Scale of 1 (Low) to 4 (Critical)"
    },
    {
        "id": "q4",
        "title": "What additional feature would you recommend for the Meyveda Vaidya community?",
        "type": "text",
        "options": [],
        "required": False,
        "helpText": "Share your thoughts directly with our engineering and clinical teams."
    }
]

def _ensure_seed_survey(db: Session) -> ClinicalSurvey:
    existing = db.query(ClinicalSurvey).filter(ClinicalSurvey.status == "active").first()
    if not existing:
        seed = ClinicalSurvey(
            title="Practitioner Clinical Intelligence & Practice Survey",
            description="Help shape the future of India's oldest sovereign medicine system. Provide your clinical feedback and unlock priority gamified beta access.",
            category="AYUSH Clinical Practice & Pharmacovigilance",
            reward_points=50,
            status="active",
            questions=DEFAULT_AYUSH_SURVEY_QUESTIONS,
            created_by_email="content@meyveda.com"
        )
        db.add(seed)
        db.commit()
        db.refresh(seed)
        return seed
    return existing

@router.get("/active", summary="Get the current active survey for practitioners")
def get_active_survey(db: Session = Depends(get_db)):
    # Retrieve the latest active survey created by the Content Manager
    survey = db.query(ClinicalSurvey).filter(ClinicalSurvey.status == "active").order_by(ClinicalSurvey.created_at.desc()).first()
    if not survey:
        return None
    # Check total responses
    total_responses = db.query(ClinicalSurveyResponse).filter(ClinicalSurveyResponse.survey_id == survey.id).count()
    return {
        "id": survey.id,
        "title": survey.title,
        "description": survey.description,
        "category": survey.category,
        "reward_points": survey.reward_points,
        "status": survey.status,
        "questions": survey.questions,
        "total_responses": total_responses,
        "created_at": survey.created_at.isoformat() if survey.created_at else None,
    }

@router.get("/manage/all", summary="Get all surveys for Content Manager with detailed completion metrics")
def get_all_surveys_for_manager(db: Session = Depends(get_db)):
    surveys = db.query(ClinicalSurvey).order_by(ClinicalSurvey.created_at.desc()).all()
    result = []
    for s in surveys:
        resp_count = db.query(ClinicalSurveyResponse).filter(ClinicalSurveyResponse.survey_id == s.id).count()
        result.append({
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "category": s.category,
            "reward_points": s.reward_points,
            "status": s.status,
            "questions": s.questions,
            "total_responses": resp_count,
            "created_by_email": s.created_by_email,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        })
    return result

@router.post("/manage/create", status_code=status.HTTP_201_CREATED, summary="Create a new survey (Google Forms style)")
def create_survey_by_manager(payload: SurveyCreateRequest, db: Session = Depends(get_db)):
    survey = ClinicalSurvey(
        title=payload.title.strip(),
        description=payload.description.strip(),
        category=payload.category.strip(),
        reward_points=payload.reward_points,
        status=payload.status,
        questions=[q.dict() for q in payload.questions],
        created_by_email="content@meyveda.com"
    )
    db.add(survey)
    db.commit()
    db.refresh(survey)
    return {"message": "Survey created successfully", "id": survey.id}

@router.put("/manage/{survey_id}", summary="Update an existing survey")
def update_survey_by_manager(survey_id: str, payload: SurveyUpdateRequest, db: Session = Depends(get_db)):
    survey = db.query(ClinicalSurvey).filter(ClinicalSurvey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    if payload.title is not None:
        survey.title = payload.title.strip()
    if payload.description is not None:
        survey.description = payload.description.strip()
    if payload.category is not None:
        survey.category = payload.category.strip()
    if payload.reward_points is not None:
        survey.reward_points = payload.reward_points
    if payload.status is not None:
        survey.status = payload.status
    if payload.questions is not None:
        survey.questions = [q.dict() for q in payload.questions]

    db.commit()
    db.refresh(survey)
    return {"message": "Survey updated successfully", "id": survey.id}

@router.delete("/manage/{survey_id}", summary="Delete a survey")
def delete_survey_by_manager(survey_id: str, db: Session = Depends(get_db)):
    survey = db.query(ClinicalSurvey).filter(ClinicalSurvey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    db.delete(survey)
    db.commit()
    return {"message": "Survey deleted successfully"}

@router.post("/submit", status_code=status.HTTP_201_CREATED, summary="Submit practitioner responses and unlock gamified points")
def submit_survey_response(payload: SurveySubmitRequest, db: Session = Depends(get_db)):
    survey = db.query(ClinicalSurvey).filter(ClinicalSurvey.id == payload.survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found or inactive")

    clean_email = (payload.doctor_email or "").strip().lower()
    clean_name = (payload.doctor_name or "Verified Doctor").strip()

    # Find doctor record if exists
    doc = None
    if clean_email:
        doc = db.query(Doctor).join(User, Doctor.user_id == User.id).filter(User.email == clean_email).first()

    # Prevent double submissions for gamified integrity
    if clean_email:
        existing_sub = (
            db.query(ClinicalSurveyResponse)
            .filter(
                ClinicalSurveyResponse.survey_id == payload.survey_id,
                ClinicalSurveyResponse.doctor_email == clean_email
            )
            .first()
        )
        if existing_sub:
            return {
                "message": "Survey already completed. Your rewards are recorded!",
                "already_submitted": True,
                "reward_points": existing_sub.reward_points_awarded
            }

    response = ClinicalSurveyResponse(
        survey_id=survey.id,
        doctor_id=doc.id if doc else None,
        doctor_email=clean_email or "doctor@practice.com",
        doctor_name=doc.full_name if doc else clean_name,
        answers=payload.answers,
        reward_points_awarded=survey.reward_points
    )
    db.add(response)
    db.commit()
    db.refresh(response)

    return {
        "message": f"Survey submitted successfully! You earned +{survey.reward_points} Reward Points.",
        "points_earned": survey.reward_points,
        "response_id": response.id
    }

@router.get("/insights/{survey_id}", summary="Get aggregated bar chart statistics and gamified participation metrics")
def get_survey_insights(survey_id: str, db: Session = Depends(get_db)):
    survey = db.query(ClinicalSurvey).filter(ClinicalSurvey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    responses = db.query(ClinicalSurveyResponse).filter(ClinicalSurveyResponse.survey_id == survey_id).all()
    total_participants = len(responses)

    # Calculate question-by-question bar graph aggregations
    questions_chart_data = []

    for q in (survey.questions or []):
        q_id = q.get("id")
        q_type = q.get("type", "radio")
        q_title = q.get("title")
        options = q.get("options", [])

        counts: Dict[str, int] = {opt: 0 for opt in options}
        text_responses = []

        for resp in responses:
            ans = resp.answers.get(q_id)
            if ans is None:
                continue

            if q_type in ("radio", "rating"):
                val = str(ans).strip()
                if val in counts:
                    counts[val] += 1
                else:
                    counts[val] = counts.get(val, 0) + 1
            elif q_type == "checkbox" and isinstance(ans, list):
                for item in ans:
                    val = str(item).strip()
                    if val in counts:
                        counts[val] += 1
                    else:
                        counts[val] = counts.get(val, 0) + 1
            elif q_type == "text":
                if str(ans).strip():
                    text_responses.append({
                        "doctor_name": resp.doctor_name,
                        "text": str(ans).strip()
                    })

        # Calculate percentages for bar graphs
        chart_bars = []
        for opt in options:
            count = counts.get(opt, 0)
            pct = round((count / total_participants * 100), 1) if total_participants > 0 else 0
            chart_bars.append({
                "option": opt,
                "votes": count,
                "percentage": pct
            })

        questions_chart_data.append({
            "question_id": q_id,
            "title": q_title,
            "type": q_type,
            "bars": chart_bars,
            "sample_feedback": text_responses[:10]
        })

    # Detailed respondent records for Content Manager
    individual_submissions = [
        {
            "id": r.id,
            "doctor_name": r.doctor_name,
            "doctor_email": r.doctor_email,
            "reward_points": r.reward_points_awarded,
            "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None,
            "answers": r.answers
        }
        for r in responses
    ]

    # Format both for chart components and frontend schemas
    question_insights = []
    for q in questions_chart_data:
        options_list = [
            {"option": b["option"], "count": b["votes"], "percentage": b["percentage"]}
            for b in q.get("bars", [])
        ]
        text_answers = [f.get("text", "") for f in q.get("sample_feedback", [])]
        total_votes = sum(b.get("votes", 0) for b in q.get("bars", []))
        question_insights.append({
            "question_id": q.get("question_id"),
            "question_title": q.get("title"),
            "question_type": q.get("type"),
            "total_votes": total_votes if total_votes > 0 else len(text_answers),
            "options": options_list,
            "text_answers": text_answers
        })

    return {
        "survey_id": survey.id,
        "title": survey.title,
        "survey_title": survey.title,
        "reward_points": survey.reward_points,
        "total_participants": total_participants,
        "total_responses": total_participants,
        "questions_chart_data": questions_chart_data,
        "question_insights": question_insights,
        "individual_submissions": individual_submissions
    }
