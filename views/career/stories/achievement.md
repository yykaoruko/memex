# Story: Reducing API latency by 40%

<!-- STAR format. Used for: "Tell me about your biggest technical achievement" -->
<!-- tags: performance, backend, impact, data-driven -->

## Situation

Our main API was consistently hitting 800ms p95 latency during peak hours, causing visible
slowness in the product. Users were complaining, and the on-call team was spending hours
per week investigating slow requests.

## Task

I volunteered to investigate and fix the issue. There was no dedicated performance team —
I had to scope the problem, get buy-in to work on it, and ship the fix alongside my regular
sprint work.

## Action

- Set up distributed tracing with OpenTelemetry to get a clear picture of where time was being
  spent. Within a day, I identified that 60% of the latency was coming from N+1 queries
  in two endpoints.
- Rewrote the queries using batch loading, eliminating the N+1 pattern.
- Added a Redis cache layer for read-heavy endpoints with data that changed less than once
  per minute, with a 30-second TTL.
- Wrote a load test suite so we could measure the impact before and after, and monitor
  regressions going forward.

## Result

p95 latency dropped from 800ms to 480ms — a 40% reduction. On-call incidents related to
slow queries dropped to near zero. The load test suite became a standard part of our
pre-deploy checklist.
