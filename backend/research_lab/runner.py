import time
from typing import Any, Dict, Tuple

from .experiments import data_processing, model_training, simulation


EXPERIMENT_REGISTRY = {
    'simulation': simulation.run,
    'data_processing': data_processing.run,
    'model_training': model_training.run,
}


def run_experiment(experiment_type: str, params: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any], int]:
    if experiment_type not in EXPERIMENT_REGISTRY:
        raise ValueError(f'Unknown experiment_type: {experiment_type}')

    start = time.perf_counter()
    output, metrics = EXPERIMENT_REGISTRY[experiment_type](params or {})
    duration_ms = int((time.perf_counter() - start) * 1000)

    return output, metrics, duration_ms
