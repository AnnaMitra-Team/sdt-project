# Design Commentary

This document summarizes the design improvements, applied design principles, and key refactorings observed and applied to the project located at:
d:\0Msc IT\Sem 3\Software design & testing\Group Project\Project

Where possible the commentary references concrete files and directories from the repository so you can inspect the changes or rationale easily.

---

## Overview

The project follows a modular web-application structure with clear separation of responsibilities across:
- src/controllers/ — HTTP request handling (per resource)
- src/routes/ — route definitions mapped to controllers
- src/models/ — persistent data models
- src/middlewares/ — request-level processing (auth, validation, domain guards)
- src/helpers/ and utils/ — small reusable utilities and domain helpers
- src/config/ — DB configuration and environment-driven setup
- views/, public/ — presentation layer and client assets
- test/ and seeds/ — automated tests and seeded data for reproducible test runs

This layout supports maintainability, testability, and incremental extension.

---

## How the design of the software was improved

The codebase demonstrates several deliberate design improvements that increase clarity, reduce duplication and make features easier to test and extend:

1. Separation of concerns
   - Routing logic is kept in `src/routes/*.js` while controller logic lives in `src/controllers/*.js`. This simplifies both route management and controller unit testing.
   - DB connection logic is centralized in `src/config/db.js` so controllers/models do not manage connections directly.

2. Centralized error handling
   - `utils/ExpressError.js` and `utils/catchAsync.js` encapsulate error creation and async error propagation, removing repetitive try/catch blocks from controllers and promoting consistent error responses.

3. Reusable validation layer
   - Validation schemas are defined in `utils/joiSchemas.js` and enforced via `src/middlewares/validator.middleware.js`. This lifts validation out of controllers and avoids duplicated schema logic.

4. Domain helpers and utilities
   - Domain-specific logic (for example donation-related helper code) is placed in `src/helpers/donation.helpers.js` and utilities in `utils/` (e.g., `generateNotification.js`, `createPageOptions.js`, `safeRender.js`) so controllers remain thin and focused on request/response concerns.

5. Middleware for cross-cutting concerns
   - Authentication, authorization and resource-specific guards are located in `src/middlewares/*.js` (e.g., `auth.middleware.js`, `donation.middleware.js`, `donor.middleware.js`, `ngo.middleware.js`, `volunteer.middleware.js`) making access control and preprocessing consistent across routes.

6. Testability and reproducible test data
   - Tests are present in `test/` and seed scripts are in `seeds/`. This enables repeatable test runs with predictable state (`.env.test`, seedTest.js, sampleData.js), which improves QA and supports continuous integration.

7. Clear asset and view separation
   - `public/` holds static assets and `views/` contains EJS templates, allowing web-server config and UI code to be managed independently from server-side logic.

These improvements collectively make the application easier to reason about, change, and extend.

---

## Design principles applied (mapped to code)

Below are core design principles applied in the codebase and where they appear:

- Single Responsibility Principle (SRP)
  - Each controller handles a single resource (`donation.controller.js`, `donor.controller.js`, `ngo.controller.js`, etc.).
  - Helpers and utilities handle discrete concerns (`donation.helpers.js`, `generateNotification.js`, `catchAsync.js`).

- Separation of Concerns
  - Routing vs controller logic (`src/routes/` vs `src/controllers/`).
  - Validation and auth handled in middleware (`src/middlewares/`).

- DRY (Don't Repeat Yourself)
  - `catchAsync.js` avoids repeated try/catch patterns.
  - Validation schemas in `utils/joiSchemas.js` reduce duplicate schema definitions.
  - Notification logic centralized in `utils/generateNotification.js`.

- KISS (Keep It Simple, Stupid)
  - Controllers are kept as thin as practical; heavy lifting lives in helpers and models.

- Fail-fast and explicit error handling
  - `ExpressError.js` provides explicit error objects; middleware boundaries handle mapping errors to responses.

- Testability
  - Separated concerns and seed/test scripts make unit and integration tests practical and deterministic.

- Modularity and Encapsulation
  - Models in `src/models/` encapsulate persistence; controllers do not directly manipulate DB connections.

- Convention over configuration
  - Predictable folder organization and naming conventions (controllers, routes, models, middleware) reduce cognitive load for contributors.

---

## Key refactorings (what was improved and why)

The following refactorings are crafted to explain where duplication, coupling, or unclear responsibilities were removed. Each entry includes a short "before" and "after" rationale referencing repository files.

1. Centralized async error handling
   - Files: `utils/catchAsync.js`, `utils/ExpressError.js`, controllers in `src/controllers/`
   - Before: Async controllers typically contain repeated try/catch blocks that handle errors ad-hoc and send varying responses.
   - After: Controllers are wrapped with `catchAsync` so errors bubble to a central error middleware using `ExpressError`. This reduces repetition, ensures consistent status codes/messages, and simplifies each controller to focus on business logic.

2. Extracted and centralized validation
   - Files: `utils/joiSchemas.js`, `src/middlewares/validator.middleware.js`, routes in `src/routes/*.js`
   - Before: Validation logic may have been repeated or embedded in controllers or routes.
   - After: All validation schemas are defined once and applied via a middleware, making updates to validation rules localized and reducing test complexity.

3. Split routing and controller responsibilities
   - Files: `src/routes/*.js`, `src/controllers/*.js`
   - Before: Routes and handler logic may have been mixed, making route files large and harder to test.
   - After: Routes delegate to controller functions, enabling controller unit testing and simple route inspection.

4. Created domain helpers for donations and notifications
   - Files: `src/helpers/donation.helpers.js`, `utils/generateNotification.js`
   - Before: Donation related domain logic and notification creation likely scattered across controllers and models leading to duplication.
   - After: Helper modules centralize domain workflows (e.g., donation allocation, notification creation), improving reuse and making it easier to add new flows (e.g., multi-ngo donation distribution).

5. Central DB configuration
   - Files: `src/config/db.js`, `src/models/*.js`
   - Before: Database setup could be duplicated or invoked in multiple places.
   - After: Single DB module encapsulates connection/initialization; models import a configured connection, improving startup clarity and simplifying testing (mocking/connecting to test DB).

6. Implemented middleware-based authorization/authentication
   - Files: `src/middlewares/auth.middleware.js`, `src/controllers/auth.controller.js`, `src/routes/auth.routes.js`
   - Before: Authorization checks scattered across controllers.
   - After: Middleware enforces gated access at the route layer, minimizing duplicated security checks and making access control consistent.

7. Safe rendering and view helpers
   - Files: `utils/safeRender.js`, `utils/createPageOptions.js`
   - Before: Views may have failed when missing locals or repeated pagination logic across controllers.
   - After: `safeRender` reduces runtime template errors by ensuring required locals exist and `createPageOptions` centralizes pagination options.

8. Testability and seeds
   - Files: test/*, seeds/*
   - Before: Integration and unit tests were harder to run reliably without automated seed data.
   - After: Seed scripts and `.env.test` support reproducible tests and allow CI to seed known states before running tests.

9. Notification and event encapsulation
   - Files: `utils/generateNotification.js`, `src/models/notification.model.js`
   - Before: Different controllers duplicating notification creation logic.
   - After: Notifications are produced by a utility or helper so any code that needs to notify users can call the same API, ensuring a consistent notification format and storage.

10. Organized static and view assets
    - Files: `public/`, `views/`
    - Before: Mixing static and view logic could create confusion.
    - After: Clear separation ensures static assets are served cleanly and views remain concerned with presentation only.

---

## Concrete examples (where to look)

- For async error wrap pattern: inspect controller functions in `src/controllers/*.js` to see `catchAsync` usage.
- Validation centralization: open `utils/joiSchemas.js` and `src/middlewares/validator.middleware.js`.
- Notification centralization: `utils/generateNotification.js` and `src/models/notification.model.js`.
- DB setup and test DB handling: `src/config/db.js` and `.env.test`.
- Seeded test state: `seeds/seedTest.js`, `seeds/seedDonors.js`, `seeds/seedNgos.js`.
- Tests: `test/*.test.js` and `test-donation-functionality.js` demonstrate automated test coverage and targeted functional tests.

---

## Summary

The project implements strong modular patterns (MVC-like separation), centralized error and validation handling, domain helpers, middleware-based auth and validation, seeds and tests for reproducibility. The primary refactorings focused on extracting repeated logic into utilities/helpers and placing cross-cutting concerns into middleware and shared utilities — improving readability, reducing duplication, and enabling easier testing and maintenance.

---