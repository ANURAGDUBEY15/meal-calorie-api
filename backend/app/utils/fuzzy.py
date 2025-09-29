from rapidfuzz import process
from typing import Any, Dict, List


class FuzzySelector:
    """Efficient fuzzy chooser for USDA results using RapidFuzz's extractOne.
    Matches query against combined description and brandName."""

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

        # RapidFuzz's extractOne is optimized and faster than manual loops
        best_match = process.extractOne(query, choices, score_cutoff=50)  # cutoff to ignore bad matches

        if best_match:
            match_str, score, _ = best_match
            return name_to_item[match_str]

        return None
