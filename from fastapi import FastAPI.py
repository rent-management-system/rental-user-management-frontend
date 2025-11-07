from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from supabase import create_client, Client

# Replace with your Supabase URL and anon key
SUPABASE_URL = "https://spdwbxirjclmafdwzkvu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZHdieGlyamNsbWFmZHd6a3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDk5NTcsImV4cCI6MjA3NjcyNTk1N30.lcoi0iksJ18jMOYZXmPyNDEFiIhNmIzv9-yiSuEHXL4"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@app.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """
    Handles a forgot password request using Supabase.
    """
    try:
        # Supabase handles token generation and sending the email
        supabase.auth.reset_password_for_email(email=request.email)
    except Exception as e:
        # Log the error for debugging, but don't expose details to the client
        print(f"Error sending password reset email: {e}")
        # Even if the user doesn't exist, we return a generic message
        # to avoid user enumeration attacks.
    
    return {"message": "If an account with that email exists, a password reset link has been sent."}

@app.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """
    Handles a password reset request using Supabase.
    This endpoint is not directly used when using Supabase's built-in password reset flow.
    The user will click a link in their email that takes them to a page where they can reset their password.
    That page will then call the Supabase API directly to update the password.
    This endpoint is left here as a reference.
    """
    try:
        # The token is a short-lived access token that Supabase provides
        # after the user clicks the link in the email.
        # You need to exchange this for a session.
        session = supabase.auth.get_session()

        if not session:
            raise HTTPException(status_code=400, detail="Invalid or expired token.")

        # Update the user's password
        supabase.auth.update_user({"password": request.new_password})

    except Exception as e:
        print(f"Error resetting password: {e}")
        raise HTTPException(status_code=400, detail="Invalid or expired token.")
    
    return {"message": "Password has been reset successfully."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
