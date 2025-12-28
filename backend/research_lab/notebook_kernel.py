import os
import requests


def _kernel_base_url() -> str:
    # In docker-compose: http://notebook-kernel:8000
    # Local dev: http://127.0.0.1:8001
    return os.getenv('NOTEBOOK_KERNEL_URL', 'http://127.0.0.1:8001').rstrip('/')


def kernel_status(timeout_seconds: int = 5):
    url = f"{_kernel_base_url()}/notebook/status"
    resp = requests.get(url, timeout=timeout_seconds)
    resp.raise_for_status()
    return resp.json()


def kernel_run(code: str, timeout_seconds: int = 30):
    url = f"{_kernel_base_url()}/notebook/run"
    resp = requests.post(url, json={'code': code}, timeout=timeout_seconds)
    resp.raise_for_status()
    return resp.json()


def kernel_install(package: str, timeout_seconds: int = 300):
    url = f"{_kernel_base_url()}/notebook/install"
    resp = requests.post(url, json={'package': package}, timeout=timeout_seconds)
    resp.raise_for_status()
    return resp.json()
