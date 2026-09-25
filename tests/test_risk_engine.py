from pathlib import Path

from ml.risk_engine import evaluate_risk
from ml.weather_processor import load_latest_weather


def test_empty_weather_is_explicitly_insufficient():
    result = evaluate_risk({})
    assert result["level"] == "INSUFFICIENT DATA"
    assert result["score"] is None


def test_multiple_weather_factors_produce_transparent_high_signal():
    result = evaluate_risk({
        "rainfall_1h": 42,
        "rainfall_24h": 120,
        "forecast_rainfall_6h": 80,
        "river_level": 1.1,
        "river_bankfull": 1.0,
        "soil_saturation": 95,
    })
    assert result["level"] == "CRITICAL"
    assert result["score"] >= 70
    assert len(result["factors"]) == 5
    assert "not a scientific forecast" in result["disclaimer"]


def test_aliases_are_supported_without_claiming_certainty():
    result = evaluate_risk({"rain_1h": 10, "rain_24h": 25})
    assert result["level"] == "LOW"
    assert result["confidence"] == "medium"


def test_uploaded_weather_schema_is_normalized_without_fabricating_hydrology():
    path = Path(__file__).parents[1] / "data" / "weatherdata.csv"
    observation = load_latest_weather(path)
    assert observation["observation_timestamp"] == "2026-08-27T23:54:21Z"
    assert observation["rainfall_1h"] == 0
    assert observation["rainfall_24h"] == 78.8
    assert observation["humidity"] == 86.2
    assert observation["source_fields"][:2] == ["rg1tt", "rg2tt"]
    assert "river_level" in observation["missing_fields"]
    result = evaluate_risk(observation)
    assert result["level"] == "LOW"
    assert result["confidence"] == "low"
    assert result["observation"]["data_source"] == "data/weatherdata.csv"
    assert "dataset-native" in result["factors"][1]["detail"]


def test_atmospheric_indicators_increase_risk_score():
    result = evaluate_risk({
        "rainfall_1h": 40,
        "humidity": 98,
        "pressure": 960,
        "wind_gust": 20,
    })
    assert result["score"] > 30
    labels = [f["label"] for f in result["factors"]]
    assert "Extreme humidity" in labels
    assert "Low barometric pressure" in labels
    assert "High wind speed / gust" in labels
