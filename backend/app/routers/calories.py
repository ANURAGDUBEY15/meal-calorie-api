
from fastapi import APIRouter, Depends
from ..schemas import CaloriesIn, CaloriesOut
from ..services.fooddata import FoodDataService, IFoodDataService
from ..security import get_current_user

def get_fooddata_service() -> IFoodDataService:
    return FoodDataService()

router = APIRouter(tags=["calories"])

@router.post("/get-calories", response_model=CaloriesOut)
async def get_calories(
    payload: CaloriesIn,
    user=Depends(get_current_user),
    fooddata_service: IFoodDataService = Depends(get_fooddata_service)
):
    """
    Guaranteed-safe calorie endpoint.
    Always returns a CaloriesOut object even if USDA fails.
    """
    result = fooddata_service.compute_calories(payload.dish_name, payload.servings)
    return CaloriesOut(**result)
