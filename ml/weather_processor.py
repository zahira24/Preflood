import csv
from datetime import datetime, timedelta, timezone
from pathlib import Path

from ml.preprocessing import normalize_weather


REAL_DATA_COLUMNS = {
    "ts", "rg1", "rg2", "rg1tt", "rg2tt", "rg1tp", "rg2tp", "temp_bmx", "press_bmx",
    "temp_mcp", "temp_sht", "humidity_sht", "si1145_vis", "si1145_ir", "si1145_uv",
    "wind_spd", "wind_dir", "wind_gust", "wind_gust_dir", "heat_idx", "wet_bulb_temp",
    "wet_bulb_globe_temp",
}
MISSING_FLOOD_FIELDS = [
    "forecast_rainfall_6h", "river_level", "river_bankfull", "soil_saturation", "tide_level", "tide_threshold",
]


def _number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _timestamp(value):
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (AttributeError, TypeError, ValueError):
        return None


def _rain_value(row):
    """Return the non-negative native rain-gauge reading for one sample.

    The uploaded file does not declare units. We retain the native values and
    document that unit uncertainty in the returned metadata instead of calling
    them millimetres.
    """
    return sum(max(0.0, _number(row.get(field)) or 0.0) for field in ("rg1tt", "rg2tt"))


def _latest_dataset(rows):
    parsed = [(stamp, row) for row in rows if (stamp := _timestamp(row.get("ts")))]
    if not parsed:
        return None
    parsed.sort(key=lambda item: item[0])
    latest_stamp, latest = parsed[-1]
    one_hour = [row for stamp, row in parsed if latest_stamp - stamp <= timedelta(hours=1)]
    one_day = [row for stamp, row in parsed if latest_stamp - stamp <= timedelta(hours=24)]

    def value(field):
        return _number(latest.get(field))

    observation = {
        "rainfall_1h": round(sum(_rain_value(row) for row in one_hour), 2),
        "rainfall_24h": round(sum(_rain_value(row) for row in one_day), 2),
        "temperature": value("temp_bmx"),
        "humidity": value("humidity_sht"),
        "pressure": value("press_bmx"),
        "wind_speed": value("wind_spd"),
        "wind_gust": value("wind_gust"),
        "observation_timestamp": latest.get("ts"),
        "data_source": "data/weatherdata.csv",
        "rainfall_method": "sum of rg1tt + rg2tt samples in the trailing time window",
        "rainfall_unit": "dataset-native; the CSV does not declare units",
        "source_fields": ["rg1tt", "rg2tt", "temp_bmx", "humidity_sht", "press_bmx", "wind_spd", "wind_gust"],
        "missing_fields": MISSING_FLOOD_FIELDS,
    }
    return {key: value for key, value in observation.items() if value is not None}


def load_latest_weather(csv_path):
    """Load the newest row if a real weatherdata.csv has been supplied.

    An empty file or header-only file returns None rather than inventing observations.
    """
    path = Path(csv_path)
    if not path.exists() or path.stat().st_size == 0:
        return None
    with path.open(newline="", encoding="utf-8") as source:
        reader = csv.DictReader(source)
        if not reader.fieldnames or not set(reader.fieldnames).intersection(REAL_DATA_COLUMNS):
            return None
        rows = list(reader)
    observation = _latest_dataset(rows)
    return normalize_weather(observation) if observation else None
