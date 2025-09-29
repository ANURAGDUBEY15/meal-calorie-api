from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, Dict, Any

class RegisterIn(BaseModel): 
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        # Ensure password includes at least one letter and one number
        if not any(c.isalpha() for c in v) or not any(c.isdigit() for c in v):
            raise ValueError("Password must contain Letters and Numbers")
        return v

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"  # Default token type for OAuth2

class CaloriesIn(BaseModel):
    dish_name: str = Field(..., min_length=2)
    servings: float = Field(..., gt=0)  # Must be greater than zero

class SelectionOut(BaseModel):
    fdcId: int  # FoodData Central ID
    description: str
    dataType: Optional[str] = None  # e.g., "Branded", "Survey", etc.

class MacrosOut(BaseModel):
    protein_g: float | None = None
    fat_g: float | None = None
    carb_g: float | None = None

class CaloriesOut(BaseModel):
    dish_name: str
    servings: float
    calories_per_serving: float
    total_calories: float
    source: str  # e.g., "USDA", "Manual Entry"
    selection: SelectionOut | None = None  # Optional FDC food selection
    macros: MacrosOut | None = None  # Optional macro breakdown
    raw: Dict[str, Any] | None = None  # Optional raw API or source data
