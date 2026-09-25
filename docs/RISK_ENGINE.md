# Prototype Risk Engine

The engine is deliberately inspectable rather than a black box. It awards points for rainfall in the last hour and 24 hours, forecast rainfall, river level relative to bankfull where available, soil saturation, and tide level relative to a threshold. Totals map to LOW, MODERATE, HIGH, or CRITICAL. No recognized observations return INSUFFICIENT DATA.

The supplied station file has no declared rainfall units, so `weather_processor.py` aggregates its `rg1tt` and `rg2tt` values without relabeling them as millimetres. Temperature, humidity, pressure, wind speed, and gust are returned as context and do not silently become hydrology proxies. The current station observation therefore returns a low-confidence prototype signal and explicitly lists missing forecast, river, soil, and tide fields.

This is not calibrated hydrology and does not represent scientific certainty. The `confidence` field reflects only how many supported factors were present. Validate thresholds against local agencies and replace the prototype with an approved model before relying on it for public warning decisions.
