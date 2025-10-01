import requests
from cachetools import TTLCache
from typing import Any, Dict, Protocol
from ..config import settings
from ..utils.fuzzy import FuzzySelector

# USDA FoodData Central API search endpoint
USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

class IFoodDataService(Protocol):
    def search_food(self, query: str) -> Dict[str, Any]: ...
    def compute_calories(self, query: str, servings: float) -> dict: ...

class FoodDataService:
    def __init__(self):
        # _cache is a protected attribute
        self._cache = TTLCache(maxsize=512, ttl=settings.CACHE_TTL_SECONDS)

    def _cache_key(self, q: str) -> str:
        return q.strip().lower()

    def search_food(self, query: str) -> Dict[str, Any]:
        key = self._cache_key(query)
        if key in self._cache:
            return self._cache[key]
        params = {
            "query": query,
            "api_key": settings.USDA_API_KEY,
            "pageSize": 25
        }
        r = requests.get(USDA_SEARCH_URL, params=params, timeout=10)
        r.raise_for_status()
        data = r.json()
        self._cache[key] = data
        return data

    @staticmethod
    def extract_energy_macros(food: dict):
        """
        Extracts energy (calories) and macronutrients (protein, fat, carbs)
        from a food item dictionary.
        """
        energy = None
        macros = {"protein_g": None, "fat_g": None, "carb_g": None}

        # Try to extract from 'labelNutrients' first (more structured)
        label = food.get("labelNutrients") or {}
        if "calories" in label:
            energy = float(label["calories"]["value"])
        if "protein" in label:
            macros["protein_g"] = float(label["protein"]["value"])
        if "fat" in label:
            macros["fat_g"] = float(label["fat"]["value"])
        if "carbohydrates" in label:
            macros["carb_g"] = float(label["carbohydrates"]["value"])

        # Fallback to 'foodNutrients' if labelNutrients is incomplete
        if energy is None:
            for n in food.get("foodNutrients", []):
                name = (n.get("nutrientName") or n.get("nutrient", {}).get("name") or "").lower()
                val = n.get("value") or n.get("amount")
                if val is None:
                    continue
                if "energy" in name or "calorie" in name:
                    energy = float(val)
                if "protein" in name:
                    macros["protein_g"] = float(val)
                if "fat" in name and macros["fat_g"] is None:
                    macros["fat_g"] = float(val)
                if "carbohydrate" in name and macros["carb_g"] is None:
                    macros["carb_g"] = float(val)

        if energy is None:
            energy = 0.0  # Default to zero if no data found

        return energy, macros

    def compute_calories(self, query: str, servings: float) -> dict:
        """
        Computes the total calorie and macro content of a dish for the given number of servings.
        Performs fuzzy matching to select the most relevant food item.
        """
        try:
            data = self.search_food(query)
            foods = data.get("foods", [])
            if not foods:
                raise ValueError("Dish not found")
            best = FuzzySelector.pick_best(query, foods)
            if not best:
                raise ValueError("Dish not found")
            energy, macros = self.extract_energy_macros(best)
            cal_per_serving = float(energy or 0.0)
            total = cal_per_serving * float(servings)
            return {
                "dish_name": query,
                "servings": float(servings),
                "calories_per_serving": round(cal_per_serving, 2),
                "total_calories": round(total, 2),
                "source": "USDA FoodData Central",
                "selection": {
                    "fdcId": best.get("fdcId"),
                    "description": best.get("description"),
                    "dataType": best.get("dataType"),
                },
                "macros": macros,
            }
        except Exception as e:
            return {
                "dish_name": query,
                "servings": float(servings),
                "calories_per_serving": 0.0,
                "total_calories": 0.0,
                "source": "USDA FoodData Central",
                "selection": None,
                "macros": None,
                "raw": {"error": str(e)},
            }