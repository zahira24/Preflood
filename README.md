# PreFlood

**Predict. Warn. Evacuate. Stay Safe.**

PreFlood is a runnable flood early-warning, evacuation, shelter, rescue, and responder prototype. It uses one Flask REST backend, SQLite, a vanilla HTML/CSS/JavaScript frontend, and a transparent Python risk engine.

The supplied `data/weatherdata.csv` is integrated. It contains 850 timestamped station observations from 2026-08-19 through 2026-08-27. The dashboard reads the latest row and derives trailing 1-hour and 24-hour rain-gauge totals from `rg1tt` and `rg2tt`, while exposing temperature, humidity, pressure, and wind as context. It does not invent river levels, forecasts, soil saturation, or tide values.

## Requirements

- Python 3.10 or newer
- A modern browser with JavaScript enabled

## Exact setup and run instructions

From the directory containing this README:

```bash
python -m venv .venv
```

Activate the environment:

```bash
# macOS / Linux
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Create local configuration:

```bash
# macOS / Linux
cp .env.example .env
export SECRET_KEY="replace-with-a-long-random-value"
export PREFLOOD_DB="database/preflood.db"

# Windows PowerShell
Copy-Item .env.example .env
$env:SECRET_KEY = "replace-with-a-long-random-value"
$env:PREFLOOD_DB = "database/preflood.db"
```

Start the application:

```bash
python run.py
```

Open `http://127.0.0.1:5000`.

The first start creates `database/preflood.db` and seeds three example shelters. To create a local admin account, set `PREFLOOD_ADMIN_EMAIL` and `PREFLOOD_ADMIN_PASSWORD` before the first start. Admin credentials are never stored in this repository.

## Test instructions

Run the backend and risk engine tests:

```bash
pytest -q
```

The tests cover registration, login, input validation, dashboard APIs, risk evaluation, emergency workflow, GET TIME, evacuation, shelter selection, route fallback, people-count occupancy, undo check-in, I AM SAFE, I NEED HELP, responder data, admin shelter lifecycle, and no-response escalation.

For a manual browser smoke test:

1. Register an account and confirm the dashboard shows the real station observation timestamp, rainfall factors, and context chips.
2. Open **Shelters**, select a shelter, and use **Check in here**. Enter `3`; occupancy increases by 4 including the registered user. Use the evacuation page check-in history to undo it.
3. Use **GET TIME** or **START EVACUATION**. GPS is requested only after that button is pressed. Denying GPS uses the route fallback instructions.
4. Use **I NEED HELP** and enter contact, people count, location/landmark, and assistance needs.
5. Set admin environment variables, restart with a new database if needed, log in as the admin, and open **Responder desk**.
6. Resize the browser to a phone width. The navigation becomes a horizontal strip and cards collapse to one column.
7. Disconnect the network after the first load. The service worker and local cache retain emergency instructions and the latest shelter/risk snapshot.

## Weather data integration

The current `data/weatherdata.csv` is the supplied station file with columns:

`ts,rg1,rg2,rg1tt,rg2tt,rg1tp,rg2tp,temp_bmx,press_bmx,temp_mcp,temp_sht,humidity_sht,si1145_vis,si1145_ir,si1145_uv,wind_spd,wind_dir,wind_gust,wind_gust_dir,heat_idx,wet_bulb_temp,wet_bulb_globe_temp`

`ml/weather_processor.py` recognizes this schema, orders valid timestamps, and aggregates the trailing windows from `rg1tt + rg2tt`. The CSV does not declare rain-gauge units, so results label rainfall as `dataset-native` and force low confidence. Missing flood-specific fields remain explicit in the API response. The prototype scoring rules are visible in `ml/risk_engine.py`, and each result includes factors, context, observation metadata, missing fields, score, confidence, and a disclaimer. Calibrate the rain-gauge units and add approved river/forecast sources before operational use.

## API outline

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/risk/current`, `POST /api/risk/evaluate`
- `GET /api/alerts`, admin/responder `POST /api/alerts`
- `GET /api/shelters`, admin `POST/PATCH/DELETE /api/shelters`
- `POST/GET /api/evacuations`, `POST /api/evacuations/<id>/safe`, `POST /api/evacuations/<id>/shelter`
- `GET /api/route`, `POST/GET /api/checkins`, `POST /api/checkins/<id>/undo`, `POST /api/checkins/<id>/checkout`
- `POST /api/rescue`, responder/admin `GET/PATCH /api/rescue`
- responder/admin `GET /api/responder/dashboard`

## Safety and production notes

Passwords are hashed with Werkzeug, sessions use Flask's signed cookie, SQL uses parameterized statements, payloads are validated, and secrets are environment variables. Add HTTPS, a real secret manager, CSRF protection for a public deployment, a production WSGI server, audited weather/routing sources, official alert integrations, and a retention policy before operational use. PreFlood is a coordination aid and never replaces emergency services or official evacuation orders.

## Structure

```text
PreFlood_Final/
├── frontend/          pages, css, js, assets, offline service worker
├── backend/           Flask app, routes, models, services, SQLite schema
├── ml/                risk engine, preprocessing, weather loader
├── data/              supplied weatherdata.csv
├── database/          runtime SQLite database location
├── tests/             pytest coverage
├── docs/              API, risk, testing, deployment notes
├── .env.example
├── requirements.txt
├── run.py
└── README.md
```
