import json
import os
from typing import Any, Dict, Optional

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "store.json")

def _ensure_data_dir():
    directory = os.path.dirname(DATA_FILE)
    if not os.path.exists(directory):
        os.makedirs(directory)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump({}, f)

def _read_store() -> Dict[str, Any]:
    _ensure_data_dir()
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def _write_store(data: Dict[str, Any]):
    _ensure_data_dir()
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

def get_user_data(key: str, default: Any = None) -> Any:
    """Retrieves data for a specific key."""
    store = _read_store()
    return store.get(key, default)

def set_user_data(key: str, value: Any):
    """Saves data for a specific key."""
    store = _read_store()
    store[key] = value
    _write_store(store)
