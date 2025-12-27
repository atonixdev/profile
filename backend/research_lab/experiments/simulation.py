import math
import random
from typing import Any, Dict, Tuple


def run(params: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Simple Monte Carlo simulation: geometric Brownian motion terminal distribution.

    Params:
      - seed: int
      - n_paths: int (default 1000)
      - n_steps: int (default 252)
      - s0: float (default 100.0)
      - mu: float (default 0.08)
      - sigma: float (default 0.2)
      - dt: float (default 1/252)
    """

    seed = int(params.get('seed', 1))
    n_paths = int(params.get('n_paths', 1000))
    n_steps = int(params.get('n_steps', 252))
    s0 = float(params.get('s0', 100.0))
    mu = float(params.get('mu', 0.08))
    sigma = float(params.get('sigma', 0.2))
    dt = float(params.get('dt', 1.0 / 252.0))

    if n_paths <= 0 or n_steps <= 0:
        raise ValueError('n_paths and n_steps must be positive')

    rnd = random.Random(seed)
    drift = (mu - 0.5 * sigma * sigma) * dt
    vol = sigma * math.sqrt(dt)

    terminals = []
    for _ in range(n_paths):
        s = s0
        for _ in range(n_steps):
            z = rnd.gauss(0.0, 1.0)
            s *= math.exp(drift + vol * z)
        terminals.append(s)

    terminals_sorted = sorted(terminals)
    mean = sum(terminals) / len(terminals)
    p05 = terminals_sorted[int(0.05 * (len(terminals_sorted) - 1))]
    p50 = terminals_sorted[int(0.50 * (len(terminals_sorted) - 1))]
    p95 = terminals_sorted[int(0.95 * (len(terminals_sorted) - 1))]

    output = {
        'terminal_prices_sample': terminals_sorted[: min(50, len(terminals_sorted))],
        'terminal_prices_count': len(terminals_sorted),
    }
    metrics = {
        'terminal_mean': mean,
        'terminal_p05': p05,
        'terminal_p50': p50,
        'terminal_p95': p95,
    }
    return output, metrics
