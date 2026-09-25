import json


def row_dict(row):
    if row is None:
        return None
    result = dict(row)
    for key in ("accessibility_json",):
        if key in result:
            try:
                result[key.removesuffix("_json")] = json.loads(result.pop(key))
            except (TypeError, json.JSONDecodeError):
                result[key.removesuffix("_json")] = []
    for key in ("active", "emergency", "approximate"):
        if key in result:
            result[key] = bool(result[key])
    return result


def rows_dict(rows):
    return [row_dict(row) for row in rows]
