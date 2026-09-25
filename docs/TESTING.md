# Testing Checklist

Automated coverage is in `tests/`. Use `pytest -q` from the project root.

Manual acceptance checks are documented in the README. Verify both a fresh browser session and an offline transition after the service worker has cached the shell. Browser console errors should remain empty during login, dashboard load, shelter selection, rescue submission, and responder view. Backend logs should show no tracebacks while running `python run.py`.
