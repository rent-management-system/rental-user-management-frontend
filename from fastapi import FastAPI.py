from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "https://rental-user-management-frontend-aer60gas4.vercel.app",
      "https://rental-user-management-frontend-62haq7v7u.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}