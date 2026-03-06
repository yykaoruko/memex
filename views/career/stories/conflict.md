# Story: Navigating a technical disagreement with a senior engineer

<!-- STAR format. Used for: "Tell me about a time you disagreed with a colleague" -->
<!-- tags: conflict, collaboration, communication, decision-making -->

## Situation

During the design phase of a new service, a senior engineer on another team strongly advocated
for a microservices-from-the-start approach. I felt this would add significant operational
complexity for a team of 3 engineers without clear benefit yet.

## Task

I needed to either align with the proposal or make a case for an alternative — without
damaging the relationship or creating a political situation.

## Action

- I asked to set up a 45-minute design review with both teams present, framing it as wanting
  to understand the trade-offs better rather than opposing the idea.
- I prepared a concrete comparison: a shared doc showing the operational overhead of both
  approaches (deploy pipelines, service mesh, observability) at our current team size.
- During the session, I acknowledged the long-term benefits of microservices and suggested
  a middle path: start with a modular monolith with clear internal boundaries, with an
  explicit plan to extract services once the domain stabilized.
- I asked the senior engineer to poke holes in my proposal rather than presenting it as
  "my side."

## Result

The team aligned on the modular monolith approach. 18 months later the service is still
running well with one extracted service where the boundary became obvious. The senior engineer
and I have since collaborated on two more designs with no friction.
