# Module Design & Data Flow

## 1. Core Data Flow Pattern
**Request** → **Router** → **Middleware (Auth + Validation)** → **Controller** → **Service/Helper** → **Model** → **Response**

## 2. Module Mapping

### A. Authentication Module
* **Routes**: `src/routes/auth.routes.js`
* **Controller**: `src/controllers/auth.controller.js`
* **Middleware**: `src/middlewares/auth.middleware.js` (Role checks: `isDonor`, `isNGO`, `isVolunteer`)
* **Key Logic**:
    * `validateRegistrationData` middleware dynamically selects Joi schemas based on the `role` field.
    * Post-registration, the controller delegates profile creation to specific logic (e.g., `createDonorProfile`).

### B. Donation Lifecycle Module
* **Routes**: `src/routes/donation.routes.js`
* **Controller**: `src/controllers/donation.controller.js`
* **Models**: `Donation`, `DonationRequest`, `DonationTeam`
* **Helpers**: `src/helpers/donation.helpers.js`
* **Flow**:
    1.  **Creation**: `POST /` → `donation.middleware.js` (validates) → `donation.helpers.js` (processes images) → Controller saves.
    2.  **Request**: `POST /:id/requests` → Controller checks duplicates → Creates `DonationRequest` → Notifies Donor.
    3.  **Scheduling**: `POST /:id/schedule-pickup` → Controller validates volunteers → Creates `DonationTeam` → Updates status to `Scheduled` → Locks volunteer availability.
    4.  **Completion**: `POST /:id/mark-completed` → Verifies image proof → Updates status to `Completed`.

### C. Notification Module
* **Model**: `src/models/notification.model.js`
* **Key Design**:
    * **Conditional Creation**: `createIfAllowed` static method checks user preferences (`notificationsEnabled`) before creating a notification, adhering to user privacy settings.
    * **Automated Emit**: Socket.io integration is decoupled from controllers; it lives entirely within the Model hooks.

## 3. Database Schema Relationships
* **User** (1) ↔ (1) **Profile** (Donor/NGO/Volunteer)
* **Donation** (1) ↔ (N) **DonationRequest**
* **Donation** (1) ↔ (1) **DonationTeam** (Created only when scheduled)
* **NGO** (1) ↔ (N) **Volunteer** (Via `volunteers` array in `NGOProfile`)