import csv
import io
import statistics
from typing import Any, Dict, List, Tuple


def _parse_numbers_csv(csv_text: str) -> List[float]:
    f = io.StringIO(csv_text)
    reader = csv.reader(f)
    values: List[float] = []
    for row in reader:
        for cell in row:
            cell = (cell or '').strip()
            if not cell:
                continue
            try:
                values.append(float(cell))
            except ValueError:
                continue
    return values


def run(params: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Data processing experiment.

    Accepts either:
      - values: list[number]
      - csv: string of comma/newline-separated values

    Returns cleaned values and summary statistics.
    """

    raw_values = params.get('values')
    csv_text = params.get('csv')

    values: List[float]
    if isinstance(raw_values, list):
        values = []
        for v in raw_values:
            try:
                values.append(float(v))
            except Exception:
                continue
    elif isinstance(csv_text, str):
        values = _parse_numbers_csv(csv_text)
    else:
        # If nothing provided, generate a small dataset
        values = [1, 2, 2, 3, 5, 8, 13, 21]

    cleaned = [v for v in values if v == v]  # drop NaN
    if not cleaned:
        raise ValueError('No valid numeric values after cleaning')

    cleaned_sorted = sorted(cleaned)
    output = {
        'cleaned_values': cleaned_sorted,
        'count': len(cleaned_sorted),
    }

    metrics = {
        'min': cleaned_sorted[0],
        'max': cleaned_sorted[-1],
        'mean': statistics.fmean(cleaned_sorted),
        'median': statistics.median(cleaned_sorted),
        'stdev': statistics.pstdev(cleaned_sorted),
    }
    return output, metrics
