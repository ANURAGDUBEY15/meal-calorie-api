from fastapi import APIRouter, Depends
from ..schemas import CaloriesIn, CaloriesOut
from ..services.fooddata import fooddata_service
from ..security import get_current_user

router = APIRouter(tags=["calories"])

@router.post("/get-calories", response_model=CaloriesOut)
async def get_calories(payload: CaloriesIn, user=Depends(get_current_user)):
    """
    Guaranteed-safe calorie endpoint.
    Always returns a CaloriesOut object even if USDA fails.
    """
    try:
        return fooddata_service.compute_calories(payload.dish_name, payload.servings)
    except Exception as e:
        # Fall back gracefully with 0 calories and include the error message for debugging
        return CaloriesOut(
            dish_name=payload.dish_name,
            servings=payload.servings,
            calories_per_serving=0.0,
            total_calories=0.0,
            source="USDA FoodData Central",
            selection=None,
            macros=None,
            raw={"error": str(e)}
        )
