import requests
from cachetools import TTLCache
from typing import Any, Dict
from ..config import settings
from ..utils.fuzzy import FuzzySelector

# USDA FoodData Central API search endpoint
USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"


class FoodDataService:
    def __init__(self):
        # Initialize in-memory cache with a max size and TTL (time-to-live)
        self.cache = TTLCache(maxsize=512, ttl=settings.CACHE_TTL_SECONDS)

    def _cache_key(self, q: str) -> str:
        # Normalize query string for use as cache key
        return q.strip().lower()

    def search_food(self, query: str) -> Dict[str, Any]:
        # Search for a food item in USDA database; use cache if available
        key = self._cache_key(query)

        if key in self.cache:
            return self.cache[key]

        # Set up query parameters for the API call
        params = {
            "query": query,
            "api_key": settings.USDA_API_KEY,
            "pageSize": 25
        }

        # Make HTTP GET request to USDA API
        r = requests.get(USDA_SEARCH_URL, params=params, timeout=10)
        r.raise_for_status()  # Raise exception for HTTP errors

        data = r.json()

        # Cache the result for future use
        self.cache[key] = data

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
            # Search for food data via USDA API
            data = self.search_food(query)
            foods = data.get("foods", [])
            if not foods:
                raise ValueError("Dish not found")

            # Use fuzzy matching to select best match
            best = FuzzySelector.pick_best(query, foods)
            if not best:
                raise ValueError("Dish not found")

            # Extract energy and macros from the selected food item
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
            # Handle errors gracefully, return fallback structure
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


# Initialize a singleton instance (optional, for shared use across app)
fooddata_service = FoodDataService()