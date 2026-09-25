# API Notes

All application endpoints are under `/api`. Authentication uses a server-side session cookie. JSON errors use `{ "error": "..." }`.

## Safety window and escalation

`POST /api/evacuations` records a three-minute `safe_deadline`. `GET /api/evacuations` and the responder dashboard reconcile overdue evacuations: the evacuation becomes `escalated` and an open rescue request is created if there is no existing request. A real production deployment should run the reconciliation in a scheduled worker as well.

## Occupancy

`POST /api/checkins` accepts `people_with_user`. `total_people` is always `people_with_user + 1`. `approximate` flags spontaneous/unregistered visitor estimates. Capacity is enforced transactionally by the SQLite-backed service flow, and `POST /api/checkins/<id>/undo` reverses the recorded total once.
