import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

# Prepare engine safely
engine = None
SessionLocal = None

try:
    db_url = settings.DATABASE_URL
    # Ensure postgresql:// scheme
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    if "YOUR-PASSWORD" not in db_url and "localhost" not in db_url:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=300,
            pool_size=5,
            max_overflow=10
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.info("SQLAlchemy PostgreSQL engine initialized.")
except Exception as e:
    logger.warning(f"SQLAlchemy direct connection deferred: {str(e)}")

def get_db():
    """FastAPI database session dependency."""
    if SessionLocal is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
