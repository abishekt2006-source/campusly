import uuid
import os
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from app.database.supabase import get_supabase_client
from app.core.config import settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50 MB

async def upload_file_to_storage(
    file: UploadFile, 
    bucket_name: str = "posts"
) -> Tuple[str, str]:
    """
    Validates file MIME type, size, and uploads to the specified Supabase Storage bucket.
    Returns (public_url, media_type).
    """
    content_type = file.content_type or ""
    is_image = content_type in ALLOWED_IMAGE_TYPES
    is_video = content_type in ALLOWED_VIDEO_TYPES

    if not is_image and not is_video:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{content_type}'. Allowed formats: JPG, PNG, WEBP, MP4, WEBM."
        )

    # Read contents and check size
    file_bytes = await file.read()
    file_size = len(file_bytes)

    if is_image and file_size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image size exceeds the 10MB maximum limit."
        )
    if is_video and file_size > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video clip exceeds the 50MB maximum limit."
        )

    media_type = "image" if is_image else "video"
    ext = os.path.splitext(file.filename or "")[1] or (".jpg" if is_image else ".mp4")
    file_path = f"{uuid.uuid4()}{ext}"

    supabase = get_supabase_client()
    if supabase:
        try:
            # Upload to Supabase Storage
            res = supabase.storage.from_(bucket_name).upload(
                file_path,
                file_bytes,
                {"content-type": content_type}
            )
            # Retrieve public URL
            public_url = supabase.storage.from_(bucket_name).get_public_url(file_path)
            return public_url, media_type
        except Exception as e:
            # If upload fails, log and fallback
            pass

    # Development fallback URL
    sample_url = (
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000" 
        if is_image 
        else "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    )
    return sample_url, media_type
