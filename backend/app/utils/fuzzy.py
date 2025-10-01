from rapidfuzz import process
from typing import Any, Dict, List


class FuzzySelector:
    """
    Efficient fuzzy chooser for USDA results using RapidFuzz's extractOne.
    Matches query against combined description and brandName.
    Now supports more aggressive matching for common misspellings and edge cases.
    """

    @staticmethod
    def pick_best(query: str, items: List[Dict[str, Any]]) -> Dict[str, Any] | None:
        if not items:
            return None

        # Map combined name string to item
        name_to_item = {
            f"{(it.get('description') or '').strip()} {(it.get('brandName') or '').strip()}": it
            for it in items
        }
        choices = list(name_to_item.keys())

        # Try exact and fuzzy match with lower cutoff for more tolerance
        best_match = process.extractOne(query, choices, score_cutoff=30)
        if best_match:
            match_str, score, _ = best_match
            return name_to_item[match_str]

        # Fallback: try partial matches if no good fuzzy match
        for choice in choices:
            if query.lower() in choice.lower():
                return name_to_item[choice]

        return None
