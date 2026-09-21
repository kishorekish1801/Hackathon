import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router
from app.routes.reports import router as reports_router
from app.services.cleanup_service import cleanup_old_resolved_reports

# Import models before create_all
import app.models


# Create database tables if they do not already exist
Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------
# AUTOMATIC CLEANUP
# ---------------------------------------------------------

async def automatic_cleanup_loop():
    """
    Run cleanup periodically while the backend is running.
    """

    while True:
        db = SessionLocal()

        try:
            deleted_count = cleanup_old_resolved_reports(db)

            if deleted_count > 0:
                print(
                    f"[AquaWatch Cleanup] "
                    f"Deleted {deleted_count} old resolved report(s)"
                )

        except Exception as exc:
            print(
                "[AquaWatch Cleanup] Error:",
                exc,
            )

        finally:
            db.close()

        # Check once every hour
        await asyncio.sleep(3600)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Start automatic cleanup when FastAPI starts
    and stop it cleanly when FastAPI shuts down.
    """

    # Run cleanup once on startup
    db = SessionLocal()

    try:
        deleted_count = cleanup_old_resolved_reports(db)

        print(
            f"[AquaWatch Cleanup] Startup check complete. "
            f"Deleted {deleted_count} report(s)."
        )

    except Exception as exc:
        print(
            "[AquaWatch Cleanup] Startup error:",
            exc,
        )

    finally:
        db.close()

    cleanup_task = asyncio.create_task(
        automatic_cleanup_loop()
    )

    yield

    cleanup_task.cancel()

    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass


# ---------------------------------------------------------
# FASTAPI APPLICATION
# ---------------------------------------------------------

app = FastAPI(
    title="AquaWatch AI API",
    description="Smart Water Management Backend",
    version="1.0.0",
    lifespan=lifespan,
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
app.include_router(admin_router)


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