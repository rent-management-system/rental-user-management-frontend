from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
import secrets
from supabase import create_client
from utils.send_email import send_reset_email

app = FastAPI()

# ✅ Enable CORS properly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for testing — later limit to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
url = "https://spdwbxirjclmafdwzkvu.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZHdieGlyamNsbWFmZHd6a3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE0OTk1NywiZXhwIjoyMDc2NzI1OTU3fQ.dAozqRHJeqrVlpBXdjwATLEH6R8BqfOR0mAeS1oJxR8"
supabase = create_client(url, key)

@app.options("/forgot-password")
async def preflight():
    """✅ Handle browser preflight (OPTIONS) requests"""
    return JSONResponse(content={"message": "CORS preflight OK"})

@app.post("/forgot-password")
async def forgot_password(request: Request):
    try:
        data = await request.json()
    except Exception:
        return JSONResponse(status_code=400, content={"detail": "Invalid JSON"})

    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    user = supabase.table("users").select("*").eq("email", email).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user.data[0]["id"]
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    reset_link = f"http://localhost:5174/reset-password?token={token}"

    supabase.table("password_resets").insert({
        "user_id": user_id,
        "email": email,
        "token": token,
        "expires_at": expires_at.isoformat(),
    }).execute()

    try:
        send_reset_email(email, reset_link)
        return {"message": "Reset link sent successfully"}
    except Exception as e:
        print("❌ Failed to send email:", e)
        raise HTTPException(status_code=500, detail="Failed to send reset email")
