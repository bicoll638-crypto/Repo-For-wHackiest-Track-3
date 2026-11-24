import re
from datetime import datetime, timezone
from typing import Optional
from app.schemas import LifeEventCreate


def parse_note_to_event(text: str, source: str = "text_note") -> LifeEventCreate:
    """
    Parses natural language voice/text notes into structured LifeEvent objects.
    Example: 'Spent 120 on snacks after late lab' -> expense, Rs 120, food.
    """
    lower = text.lower().strip()
    now = datetime.now(timezone.utc)

    # 1. EXPENSE MATCHING
    # Matches: spent 120, paid 350, 450 rs, rs 120, etc.
    spend_patterns = [
        r"(?:spent|paid|bought|ordered|cost|for)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)",
        r"(?:rs\.?|inr|₹)\s*(\d+(?:\.\d+)?)",
        r"(\d+(?:\.\d+)?)\s*(?:rs|rupees|bucks)",
    ]
    amount: Optional[float] = None
    for pattern in spend_patterns:
        match = re.search(pattern, lower)
        if match:
            amount = float(match.group(1))
            break

    if amount is not None or any(w in lower for w in ["spent", "bought", "paid", "zomato", "swiggy", "uber", "canteen", "ordered"]):
        # Determine category & merchant
        category = "general"
        merchant = "Local Vendor"

        if any(w in lower for w in ["snack", "snacks", "food", "dinner", "lunch", "biryani", "burger", "pizza", "canteen", "maggi", "coffee", "tea", "zomato", "swiggy"]):
            category = "food"
            if "zomato" in lower:
                merchant = "Zomato"
            elif "swiggy" in lower:
                merchant = "Swiggy"
            elif "canteen" in lower:
                merchant = "Campus Canteen"
            else:
                merchant = "Food & Refreshments"

        elif any(w in lower for w in ["uber", "ola", "auto", "metro", "bus", "cab", "ride"]):
            category = "transit"
            merchant = "Uber" if "uber" in lower else "Campus Transit"

        elif any(w in lower for w in ["book", "xerox", "lab record", "notes", "stationery"]):
            category = "academic"
            merchant = "Stationery & Books"

        return LifeEventCreate(
            event_type="expense",
            title=text.strip().capitalize(),
            timestamp=now,
            amount=amount or 100.0,
            category=category,
            merchant=merchant,
            status="completed",
            source=source,
            confidence_score=0.96 if amount else 0.85,
            raw_text=text
        )

    # 2. SLEEP MATCHING
    # Matches: "slept 5 hours", "slept for 6.5 hrs", "slept late"
    sleep_match = re.search(r"slept(?:\s+for)?\s+(\d+(?:\.\d+)?)\s*(?:hours|hrs|hr|h)?", lower)
    if sleep_match or "sleep" in lower or "woke up" in lower:
        hours = float(sleep_match.group(1)) if sleep_match else 5.0
        minutes = int(hours * 60)
        status = "low_sleep" if hours < 6 else "completed"
        return LifeEventCreate(
            event_type="sleep",
            title=f"Sleep Log ({hours:.1f} hrs)",
            timestamp=now,
            duration_minutes=minutes,
            status=status,
            source=source,
            confidence_score=0.95,
            raw_text=text
        )

    # 3. CLASS ATTENDANCE MATCHING
    # Matches: "skipped 8:30 OS class", "missed DBMS lecture", "attended math class"
    if any(w in lower for w in ["class", "lecture", "lab", "prof", "attended", "missed", "skipped"]):
        status = "attended"
        if any(w in lower for w in ["missed", "skipped", "absent", "slept through"]):
            status = "missed"
        elif "late" in lower:
            status = "late"

        subject = "General Course"
        for s in ["Operating Systems", "OS", "DBMS", "Database", "Mathematics", "Networks", "Data Structures"]:
            if s.lower() in lower:
                subject = s
                break

        return LifeEventCreate(
            event_type="class",
            title=f"{subject} Lecture ({status.capitalize()})",
            timestamp=now,
            subject=subject,
            status=status,
            source=source,
            confidence_score=0.94,
            raw_text=text
        )

    # 4. STUDY SESSION MATCHING
    # Matches: "studied DBMS for 90 minutes", "study session 2 hours"
    study_match = re.search(r"(\d+)\s*(?:mins|minutes|min|hours|hrs|hr)", lower)
    if "study" in lower or "studied" in lower or "revision" in lower or "prep" in lower:
        duration = 60
        if study_match:
            val = int(study_match.group(1))
            duration = val * 60 if ("hour" in lower or "hr" in lower) else val

        subject = "General Review"
        for s in ["Operating Systems", "OS", "DBMS", "Database", "Mathematics", "Networks"]:
            if s.lower() in lower:
                subject = s
                break

        return LifeEventCreate(
            event_type="study",
            title=f"{subject} Study Block",
            timestamp=now,
            duration_minutes=duration,
            subject=subject,
            status="completed",
            source=source,
            confidence_score=0.95,
            raw_text=text
        )

    # 5. DEADLINE MATCHING
    if any(w in lower for w in ["due", "deadline", "assignment", "exam", "mid-term", "submission"]):
        subject = "Academic Course"
        for s in ["Operating Systems", "OS", "DBMS", "Database", "Mathematics"]:
            if s.lower() in lower:
                subject = s
                break

        return LifeEventCreate(
            event_type="deadline",
            title=text.strip().capitalize(),
            timestamp=now,
            subject=subject,
            status="pending",
            source=source,
            confidence_score=0.92,
            raw_text=text
        )

    # Fallback to general note
    return LifeEventCreate(
        event_type="study",
        title=text.strip().capitalize(),
        timestamp=now,
        status="completed",
        source=source,
        confidence_score=0.75,
        raw_text=text
    )
