# ADR 001: Standardize ECS Time Semantics

## Status

Accepted

## Context

The Entity-Component-System (ECS) architecture requires a consistent way to pass time-related data to all components and systems during the main game loop. Previously, `deltaTime` and `elapsedTime` were passed as separate arguments, leading to inconsistencies and bugs where some components were not receiving the correct `elapsedTime` value. Some components were also manually and incorrectly accumulating their own version of elapsed time.

## Decision

We will standardize the update method signature for all ECS components and systems to accept a single context object: `UpdateCtx`.

This object is defined as:
```javascript
/**
 * @typedef {object} UpdateCtx
 * @property {number} dt - The time delta since the last frame in seconds (deltaTime).
 * @property {number} t - The total elapsed time in seconds (elapsedTime).
 */
```

The main game loop will be responsible for creating this context object once per frame and passing it down the entire update chain (`game -> world -> entity -> component`).

All components must be refactored to use this new signature, `update({ dt, t })`, and must source their time data from this context. Ad-hoc time accumulation within components is to be removed.

## Consequences

**Positive:**
-   Fixes bugs related to time-based animations and calculations (e.g., floating, shader effects).
-   Provides a single, clear, and consistent update signature across the entire ECS.
-   Reduces redundant code by eliminating the need for components to manage their own elapsed time.

**Negative:**
-   Requires a one-time refactoring of all existing components.

**Summary from user:** Standardize ECS update({dt,t}). Remove legacy elapsed emulation. No behavior change except fixing time-based bugs. Added tests.
