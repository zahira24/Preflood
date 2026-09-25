"""Small, inspectable feature normalization helpers for the prototype engine."""


def number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def normalize_weather(raw):
    if not isinstance(raw, dict):
        return {}
    aliases = {
        "rain_1h": "rainfall_1h",
        "rain_24h": "rainfall_24h",
        "river": "river_level",
        "forecast_6h": "forecast_rainfall_6h",
        "soil": "soil_saturation",
        "tide": "tide_level",
    }
    metadata = {"timestamp", "observation_timestamp", "data_source", "rainfall_method", "rainfall_unit", "missing_fields", "source_fields"}
    result = {}
    for key, value in raw.items():
        canonical = aliases.get(key, key)
        parsed = number(value)
        if parsed is not None:
            result[canonical] = parsed
        elif canonical in metadata and value is not None:
            result[canonical] = value
    return result
