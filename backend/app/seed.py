import json
import os
from datetime import datetime, timezone
from sqlmodel import Session, select
from app.db import engine, init_db
from app.models import LifeEvent, UserProfile
from app.config import settings


def seed_database(force: bool = False):
    init_db()
    with Session(engine) as session:
        # Check if already seeded
        existing_profile = session.exec(
            select(UserProfile).where(UserProfile.user_id == settings.DEMO_USER_ID)
        ).first()

        existing_events_count = len(
            session.exec(
                select(LifeEvent).where(LifeEvent.user_id == settings.DEMO_USER_ID)
            ).all()
        )

        if existing_profile and existing_events_count > 0 and not force:
            print(f"[Seed] Database already contains {existing_events_count} events for {settings.DEMO_USER_ID}.")
            return existing_events_count

        if force:
            # Clear existing data for demo user
            events = session.exec(select(LifeEvent).where(LifeEvent.user_id == settings.DEMO_USER_ID)).all()
            for ev in events:
                session.delete(ev)
            if existing_profile:
                session.delete(existing_profile)
            session.commit()

        # Create Profile
        profile = UserProfile(
            user_id=settings.DEMO_USER_ID,
            name=settings.DEMO_USER_NAME,
            college="RVCE Bengaluru",
            semester="2nd Year CSE",
            monthly_budget=settings.MONTHLY_BUDGET,
            currency="INR"
        )
        session.add(profile)

        # Load fixture
        fixture_path = os.path.join(os.path.dirname(__file__), "fixtures", "demo_events.json")
        with open(fixture_path, "r", encoding="utf-8") as f:
            raw_events = json.load(f)

        count = 0
        for item in raw_events:
            ts = datetime.fromisoformat(item["timestamp"])
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            event = LifeEvent(
                user_id=settings.DEMO_USER_ID,
                event_type=item["event_type"],
                title=item["title"],
                timestamp=ts,
                amount=item.get("amount"),
                category=item.get("category"),
                merchant=item.get("merchant"),
                duration_minutes=item.get("duration_minutes"),
                status=item.get("status"),
                subject=item.get("subject"),
                confidence_score=item.get("confidence_score", 1.0),
                source=item.get("source", "seed")
            )
            session.add(event)
            count += 1

        session.commit()
        print(f"[Seed] Successfully seeded {count} demo events for {settings.DEMO_USER_NAME}!")
        return count


if __name__ == "__main__":
    seed_database(force=True)
