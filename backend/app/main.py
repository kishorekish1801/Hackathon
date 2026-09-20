from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routes.auth import router as auth_router
from app.routes.reports import router as reports_router

# Import models before create_all
import app.models


# Create database tables if they do not already exist
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AquaWatch AI API",
    description="Smart Water Management Backend",
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# ROUTES
# ---------------------------------------------------------

app.include_router(auth_router)
app.include_router(reports_router)


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "AquaWatch AI Backend is running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok"
    }