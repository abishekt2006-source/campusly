import logging
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

_supabase_client: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    """
    Returns an initialized Supabase Python Client.
    Uses SERVICE_ROLE_KEY if provided for secure administrative queries,
    falling back to SUPABASE_KEY.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
    
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY

    # Check if real credentials are configured
    if not url or "your-project-id" in url or not key or "your-supabase" in key:
        logger.warning(
            "⚠️ Supabase credentials are not fully configured in backend/.env. Running with local development fallback."
        )
        return None

    try:
        _supabase_client = create_client(url, key)
        logger.info("Successfully connected to Supabase client.")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to connect to Supabase: {str(e)}")
        return None
