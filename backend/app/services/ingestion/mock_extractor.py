import os
from datetime import datetime, timezone
from typing import List
from app.schemas import LifeEventCreate


def extract_events_from_file(filename: str, file_bytes: bytes) -> List[LifeEventCreate]:
    """
    Mock extractor: returns realistic parsed events from fixtures/heuristics
    when a student uploads a UPI screenshot, timetable PDF, or sleep export.
    """
    fn_lower = filename.lower()
    now = datetime.now(timezone.utc)

    # Case 1: UPI screenshot / Food delivery receipt
    if any(k in fn_lower for k in ["upi", "screenshot", "receipt", "gpay", "phonepe", "paytm", "zomato", "swiggy"]):
        return [
            LifeEventCreate(
                event_type="expense",
                title="Zomato Late Night Delivery",
                timestamp=now.replace(hour=23, minute=35, second=0, microsecond=0),
                amount=245.0,
                category="food",
                merchant="Zomato - Empire Suites",
                status="completed",
                source="mock_file_upload",
                confidence_score=0.98,
                raw_text="UPI Ref: 4329871109 | Paid to Zomato Online | Rs 245.00 | Nov 24, 11:35 PM"
            )
        ]

    # Case 2: Timetable / Academic PDF or image
    elif any(k in fn_lower for k in ["timetable", "schedule", "syllabus", "calendar"]):
        return [
            LifeEventCreate(
                event_type="class",
                title="Operating Systems Lab Session",
                timestamp=now.replace(hour=8, minute=30, second=0, microsecond=0),
                subject="Operating Systems",
                status="pending",
                source="mock_file_upload",
                confidence_score=0.96,
                raw_text="Extracted Schedule: Operating Systems Lab (CSE-402) at 08:30 AM in Lab 3"
            ),
            LifeEventCreate(
                event_type="deadline",
                title="OS Lab Record Submission",
                timestamp=now.replace(hour=17, minute=0, second=0, microsecond=0),
                subject="Operating Systems",
                status="pending",
                source="mock_file_upload",
                confidence_score=0.94,
                raw_text="Deadline: Completed OS Lab Record to be signed by 5:00 PM"
            )
        ]

    # Case 3: Sleep / Biometric Tracker export
    elif any(k in fn_lower for k in ["sleep", "health", "fitbit", "apple_health", "whoop"]):
        return [
            LifeEventCreate(
                event_type="sleep",
                title="Night Sleep Tracker Log",
                timestamp=now.replace(hour=3, minute=15, second=0, microsecond=0),
                duration_minutes=310,
                status="low_sleep",
                source="mock_file_upload",
                confidence_score=0.95,
                raw_text="Sleep Record: 5h 10m total sleep. REM: 45m. Sleep onset: 03:15 AM."
            )
        ]

    # Default fallback: realistic expense parsed from general invoice/receipt
    return [
        LifeEventCreate(
            event_type="expense",
            title="Campus Book Depot Reference Book",
            timestamp=now,
            amount=380.0,
            category="academic",
            merchant="Campus Book Depot",
            status="completed",
            source="mock_file_upload",
            confidence_score=0.92,
            raw_text=f"Uploaded receipt {filename}: ₹380.00 debit verified"
        )
    ]
