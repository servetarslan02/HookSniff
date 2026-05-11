"""
HookSniff Serialization Utilities

Provides _to_json() and _from_json() static methods for model classes.
- Required field validation
- Null/default handling
- Extra field ignore (Pydantic default behavior)
"""

import json
from typing import Any, Dict, List, Optional, Type, TypeVar

from pydantic import BaseModel, ValidationError

T = TypeVar("T", bound=BaseModel)


class SerializationError(ValueError):
    """Raised when serialization/deserialization validation fails."""
    pass


def _collect_required_fields(model_cls: Type[BaseModel]) -> List[str]:
    """Return list of required field names for a Pydantic model."""
    required = []
    for name, field in model_cls.model_fields.items():
        if field.is_required():
            required.append(name)
    return required


def _collect_all_fields(model_cls: Type[BaseModel]) -> List[str]:
    """Return list of all known field names for a Pydantic model."""
    return list(model_cls.model_fields.keys())


def _to_json_static(obj: Dict[str, Any], model_cls: Type[BaseModel]) -> Dict[str, Any]:
    """
    Serialize a model dict to JSON-safe dict.

    - Validates required fields are present and non-null
    - Strips unknown/extra fields
    - Returns clean dict for JSON serialization
    """
    if obj is None:
        raise SerializationError("Cannot serialize None to JSON")

    if not isinstance(obj, dict):
        raise SerializationError(f"Expected dict, got {type(obj).__name__}")

    required = _collect_required_fields(model_cls)
    all_fields = set(_collect_all_fields(model_cls))

    # Validate required fields
    missing = [f for f in required if f not in obj or obj[f] is None]
    if missing:
        raise SerializationError(
            f"Missing required fields for {model_cls.__name__}: {missing}"
        )

    # Strip extra fields, keep only known
    return {k: v for k, v in obj.items() if k in all_fields}


def _from_json_static(data: Dict[str, Any], model_cls: Type[BaseModel]) -> BaseModel:
    """
    Deserialize a JSON dict into a Pydantic model instance.

    - Validates required fields are present
    - Applies defaults for missing optional fields (via from_dict)
    - Ignores extra/unknown fields
    - Returns validated model instance
    """
    if data is None:
        raise SerializationError("Cannot deserialize None")

    if not isinstance(data, dict):
        raise SerializationError(f"Expected dict, got {type(data).__name__}")

    # Use model's from_dict which handles defaults properly
    # from_dict already filters known fields and applies defaults
    try:
        return model_cls.from_dict(data)
    except (ValidationError, KeyError, TypeError, ValueError) as e:
        raise SerializationError(
            f"Deserialization failed for {model_cls.__name__}: {e}"
        ) from e
