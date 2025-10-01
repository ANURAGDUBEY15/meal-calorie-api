from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from .config import settings
from .database import Base, db
from .routers import auth, calories

# Create database tables based on models
Base.metadata.create_all(bind=db.engine)

# Initialize FastAPI app with a title
app = FastAPI(title="Meal Calorie Count Generator (USDA)")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://meal-calorie-api.vercel.app",
    ]
)

# Initialize rate limiter with IP address as key function
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"]
)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# Custom exception handler for rate limit exceeded errors
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return exc

# Include routers for auth and calories modules
app.include_router(auth.router)
app.include_router(calories.router)


# Root endpoint - simple welcome message
@app.get("/")
def root():
    return {"ok": True, "message": "Welcome to the Meal Calorie Count Generator"}

