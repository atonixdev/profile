import statistics
from typing import Any, Dict, List, Tuple


def _fit_simple_linear_regression(xs: List[float], ys: List[float]) -> Tuple[float, float]:
    """Fits y = a + b*x using closed-form least squares."""
    if len(xs) != len(ys) or len(xs) < 2:
        raise ValueError('xs and ys must have the same length and contain at least 2 points')

    x_mean = statistics.fmean(xs)
    y_mean = statistics.fmean(ys)

    num = 0.0
    den = 0.0
    for x, y in zip(xs, ys):
        dx = x - x_mean
        num += dx * (y - y_mean)
        den += dx * dx

    if den == 0.0:
        raise ValueError('Cannot fit regression when all x values are identical')

    b = num / den
    a = y_mean - b * x_mean
    return a, b


def run(params: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Tiny "model training" experiment (no external ML libs required).

    Params:
      - xs: list[number]
      - ys: list[number]

    Returns fitted coefficients and basic fit metrics.
    """

    xs_raw = params.get('xs')
    ys_raw = params.get('ys')

    if not isinstance(xs_raw, list) or not isinstance(ys_raw, list):
        # Default synthetic linear-ish data
        xs = [0, 1, 2, 3, 4, 5]
        ys = [1, 3, 5, 7, 9, 11]
    else:
        xs = [float(x) for x in xs_raw]
        ys = [float(y) for y in ys_raw]

    a, b = _fit_simple_linear_regression(xs, ys)

    y_hat = [a + b * x for x in xs]
    residuals = [y - yh for y, yh in zip(ys, y_hat)]
    mse = statistics.fmean([r * r for r in residuals])

    output = {
        'coefficients': {'intercept': a, 'slope': b},
        'predictions': y_hat,
    }
    metrics = {
        'mse': mse,
        'n': len(xs),
    }
    return output, metrics
