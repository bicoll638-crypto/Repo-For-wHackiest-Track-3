from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db import get_session
from app.schemas import WhatIfRequest, WhatIfResponse
from app.services.whatif import run_whatif_simulation
from app.config import settings

router = APIRouter(prefix="/api/whatif", tags=["WhatIf"])


@router.post("", response_model=WhatIfResponse)
def post_whatif(
    payload: WhatIfRequest,
    session: Session = Depends(get_session)
):
    """
    Evaluates what-if hypothetical questions against current data twin patterns.
    Computes transparent consequences, risk score (0-100), and spoken response.
    """
    return run_whatif_simulation(
        question=payload.question,
        session=session,
        user_id=settings.DEMO_USER_ID
    )
