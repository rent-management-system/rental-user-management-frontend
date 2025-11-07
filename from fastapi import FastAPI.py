from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import secrets
import uvicorn

app = FastAPI()

# In-memory storage for password reset tokens.
# In a real application, you would use a database.
password_reset_tokens = {}

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@app.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """
    Handles a forgot password request. In a real application, this would send an
    email to the user with a password reset link containing the generated token.
    """
    # In a real application, you would look up the user by email in your database.
    # If the user exists, generate a token and store it with an expiration date.
    # Then, send an email to the user with the password reset link.
    
    token = secrets.token_urlsafe(32)
    password_reset_tokens[token] = request.email
    
    # In a real app, you'd send an email with a link like:
    # https://your-frontend.com/reset-password?token={token}
    print(f"Password reset token for {request.email}: {token}")
    
    return {"message": "If an account with that email exists, a password reset link has been sent."}

@app.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """
    Handles a password reset request.
    """
    email = password_reset_tokens.get(request.token)
    
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")
        
    # In a real application, you would:
    # 1. Verify the token and its expiration date.
    # 2. Find the user by the email associated with the token.
    # 3. Hash the new password.
    # 4. Update the user's password in the database.
    # 5. Invalidate the reset token.
    
    print(f"Password for {email} has been reset to: {request.new_password}")
    
    # Invalidate the token
    del password_reset_tokens[request.token]
    
    return {"message": "Password has been reset successfully."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)



