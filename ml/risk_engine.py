"""Transparent prototype flood risk engine; not a scientific forecast."""

from ml.preprocessing import normalize_weather


LEVELS = ("LOW", "MODERATE", "HIGH", "CRITICAL")
CONTEXT_FIELDS = (
    ("temperature", "Temperature", "°C"),
    ("humidity", "Humidity", "%"),
    ("pressure", "Pressure", "hPa"),
    ("wind_speed", "Wind speed", "native units"),
    ("wind_gust", "Wind gust", "native units"),
)


def evaluate_risk(weather):
    values = normalize_weather(weather)
    numeric_fields = {key for key, value in values.items() if isinstance(value, (int, float))}
    if not numeric_fields:
        return {
            "level": "INSUFFICIENT DATA",
            "score": None,
            "confidence": "none",
            "factors": [],
            "disclaimer": "Prototype signal only. Add current weather observations for an estimate.",
        }
    score = 0
    factors = []

    def add(label, points, detail):
        nonlocal score
        score += points
        factors.append({"label": label, "points": points, "detail": detail})

    rain_1h = values.get("rainfall_1h")
    rain_24h = values.get("rainfall_24h")
    rainfall_unit = values.get("rainfall_unit", "native units")
    rainfall_label = "dataset-native" if "dataset-native" in str(rainfall_unit).lower() else str(rainfall_unit)
    forecast = values.get("forecast_rainfall_6h")
    river = values.get("river_level")
    river_bankfull = values.get("river_bankfull")
    soil = values.get("soil_saturation")
    tide = values.get("tide_level")
    tide_threshold = values.get("tide_threshold")

    if rain_1h is not None:
        points = 30 if rain_1h >= 35 else 20 if rain_1h >= 15 else 8 if rain_1h >= 5 else 0
        add("Rainfall, last hour", points, f"{rain_1h:g} {rainfall_label}")
    if rain_24h is not None:
        points = 25 if rain_24h >= 100 else 15 if rain_24h >= 50 else 6 if rain_24h >= 20 else 0
        add("Rainfall, last 24 hours", points, f"{rain_24h:g} {rainfall_label}")
    if forecast is not None:
        points = 20 if forecast >= 75 else 12 if forecast >= 35 else 4 if forecast >= 10 else 0
        add("Forecast rain, next 6 hours", points, f"{forecast:g} mm")
    if river is not None:
        if river_bankfull and river_bankfull > 0:
            ratio = river / river_bankfull
            points = 35 if ratio >= 1 else 25 if ratio >= 0.85 else 10 if ratio >= 0.7 else 0
            add("River level vs bankfull", points, f"{river:g} / {river_bankfull:g}")
        else:
            add("River level", 10 if river > 0 else 0, f"{river:g} (bankfull missing)")
    if soil is not None:
        points = 15 if soil >= 90 else 8 if soil >= 70 else 0
        add("Soil saturation", points, f"{soil:g}%")
    if tide is not None and tide_threshold is not None:
        points = 15 if tide >= tide_threshold else 0
        add("Tide level", points, f"{tide:g} / threshold {tide_threshold:g}")

    humidity = values.get("humidity")
    pressure = values.get("pressure")
    wind_speed = values.get("wind_speed")
    wind_gust = values.get("wind_gust")
    temperature = values.get("temperature")

    if humidity is not None and humidity >= 95:
        add("Extreme humidity", 10, f"{humidity:g}%")
    if pressure is not None and (pressure <= 800 or (950 < pressure <= 975)):
        add("Low barometric pressure", 10, f"{pressure:g} hPa")
    if (wind_gust is not None and wind_gust >= 15) or (wind_speed is not None and wind_speed >= 12):
        spd_val = wind_speed if wind_speed is not None else 0
        gst_val = wind_gust if wind_gust is not None else 0
        add("High wind speed / gust", 10, f"spd {spd_val:g} / gust {gst_val:g}")

    context = [
        {"label": label, "value": f"{values[field]:g} {unit}".strip(), "field": field}
        for field, label, unit in CONTEXT_FIELDS
        if field in values
    ]
    observed = len(factors)
    if observed == 0:
        return {
            "level": "INSUFFICIENT DATA", "score": None, "confidence": "none", "factors": [],
            "context": context,
            "disclaimer": "Prototype signal only. No recognized flood-risk factors were supplied.",
        }
    level = "CRITICAL" if score >= 70 else "HIGH" if score >= 45 else "MODERATE" if score >= 20 else "LOW"
    confidence = "low" if "dataset-native" in str(rainfall_unit).lower() else "high" if observed >= 4 else "medium" if observed >= 2 else "low"
    return {
        "level": level, "score": score, "confidence": confidence, "factors": factors, "context": context,
        "observation": {
            key: values[key]
            for key in ("observation_timestamp", "data_source", "rainfall_method", "rainfall_unit", "source_fields", "missing_fields")
            if key in values
        },
        "disclaimer": "Prototype signal only, not a scientific forecast. Follow official local instructions.",
    }
