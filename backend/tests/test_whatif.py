import pytest
from app.services.llm.template_llm import TemplateLLMService
from app.schemas import BudgetSummary


@pytest.fixture
def sample_budget():
    return BudgetSummary(
        monthly_budget=6000.0,
        total_spent=4769.0,
        remaining_budget=1231.0,
        burn_rate_daily=207.3,
        target_daily_budget=200.0,
        projected_depletion_day=24,
        projected_depletion_date="November 24th",
        days_early=6,
        days_remaining_in_month=7,
        status="critical_burn"
    )


def test_whatif_late_night_order(sample_budget):
    llm = TemplateLLMService()
    res = llm.answer_whatif("What if I order Zomato tonight?", events=[], budget=sample_budget)
    assert res.intent == "late_night_order"
    assert res.risk_score >= 80
    assert len(res.predicted_consequences) >= 3
    assert "8:30" in res.spoken_answer or "sleep" in res.spoken_answer


def test_whatif_skip_class(sample_budget):
    llm = TemplateLLMService()
    res = llm.answer_whatif("What if I skip tomorrow's 8:30 AM class?", events=[], budget=sample_budget)
    assert res.intent == "skip_class"
    assert res.risk_score >= 90
    assert res.risk_level == "critical"
    assert "75%" in res.spoken_answer or "Operating Systems" in res.spoken_answer


def test_whatif_discretionary_spend(sample_budget):
    llm = TemplateLLMService()
    res = llm.answer_whatif("What if I buy headphones for 1200?", events=[], budget=sample_budget)
    assert res.intent == "purchase"
    assert res.risk_score >= 80
    assert "1200" in res.spoken_answer or "1,200" in res.spoken_answer
