.PHONY: dev test seed install clean

dev:
	@echo "Starting AURA Backend and Frontend..."
	@bash run.sh

test:
	@echo "Running backend test suite..."
	@cd backend && PYTHONPATH=. venv/bin/pytest -v

seed:
	@echo "Reseeding 30-day demo database for Arjun..."
	@cd backend && venv/bin/python -c "from app.seed import seed_database; seed_database(force=True)"

install:
	@echo "Setting up Python virtualenv and frontend dependencies..."
	@python -m venv backend/venv
	@backend/venv/bin/pip install -r backend/requirements.txt
	@cd frontend && npm install

clean:
	@rm -rf backend/aura.db backend/.pytest_cache frontend/.next
