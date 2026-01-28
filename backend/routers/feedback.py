from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import json
import os
from datetime import datetime

router = APIRouter(
    prefix="/api/feedback",
    tags=["feedback"],
)

class FeedbackSubmission(BaseModel):
    q1_answer: str
    q2_answer: str
    q3_answer: str
    q4_answer: str
    open_feedback: str
    email: Optional[str] = None # Optional user email

DATA_FILE = "data/feedback_submissions.json"

def save_feedback_to_file(feedback: FeedbackSubmission):
    feedback_data = feedback.dict()
    feedback_data["timestamp"] = datetime.now().isoformat()
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    
    # Load existing or create new list
    submissions = []
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r") as f:
                submissions = json.load(f)
        except json.JSONDecodeError:
            submissions = [] # Corrupt file, start over (or handle better in prod)
            
    submissions.append(feedback_data)
    
    with open(DATA_FILE, "w") as f:
        json.dump(submissions, f, indent=4)

    # TODO: Add Email Sending Logic Here
    # Example: send_email(to="ryanvazzanonelson@gmail.com", subject="New Feedback", body=str(feedback_data))
    print(f"Feedback received and saved. TODO: Email to ryanvazzanonelson@gmail.com")


@router.post("/submit")
async def submit_feedback(feedback: FeedbackSubmission, background_tasks: BackgroundTasks):
    """
    Submit user feedback.
    Currently saves to a JSON file.
    """
    try:
        background_tasks.add_task(save_feedback_to_file, feedback)
        return {"status": "success", "message": "Feedback received"}
    except Exception as e:
        print(f"Error saving feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to save feedback")
