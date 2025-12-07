# System Architecture: AnnaMitra

## 1. Overview
AnnaMitra is a monolithic web application designed to facilitate food donation distribution. It utilizes a **Model-View-Controller (MVC)** architectural pattern to separate concerns between data management, user interface, and application logic.

## 2. Tech Stack
* **Runtime Environment**: Node.js
* **Framework**: Express.js (v5.1.0)
* **Database**: MongoDB (Mongoose ODM v8.16.3)
* **Templating Engine**: EJS (Server-side rendering)
* **Real-time Communication**: Socket.io (v4.8.1)
* **Authentication**: Passport.js (Local Strategy)

## 3. Architectural Layers
### Presentation Layer (Views)
* **Technology**: EJS Templates
* **Location**: `/src/views`
* **Responsibility**: Renders HTML dynamically based on data provided by controllers. Organized by role (`donor/`, `ngo/`, `volunteer/`) to enforce separation of user experiences.

### Logic Layer (Controllers & Middleware)
* **Controllers**: located in `/src/controllers`. Handle business logic, orchestrate data flow, and select views.
* **Middleware**: located in `/src/middlewares`. Intercepts requests for:
    * **Validation**: Joi schemas ensure data integrity before reaching controllers.
    * **Auth**: Role-based access control (RBAC) restricts access to specific routes.
    * **Data Transformation**: Helper functions (e.g., `donation.helpers.js`) clean and format complex data structures like multi-image uploads.

### Data Layer (Models)
* **Technology**: Mongoose Schemas
* **Location**: `/src/models`
* **Responsibility**: Defines data structure, validation rules, and database interactions.
* **Key Pattern**: **Observer Pattern** implemented via Mongoose hooks in `notification.model.js` to emit real-time Socket.io events upon data changes.

## 4. Real-time Event Architecture
The system uses a unified Notification model that acts as an event bus:
1.  **Trigger**: Controller performs an action (e.g., `donation.controller.js` creates a donation).
2.  **Persistence**: Notification is saved to MongoDB.
3.  **Broadcast**: A Mongoose `post('save')` hook detects the new document.
4.  **Delivery**: The hook retrieves the recipient's socket ID from the global `onlineUsers` map and emits a `new-notification` event instantly.

## 5. Folder Structure

index.js
public/
src/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── helpers/
├── utils/
├── views/

Each layer is **strictly separated**, enforcing clean MVC principles.

---

## 6. User Roles & Responsibilities

### 6.1 Donor
- Create food donations  
- Edit/Delete donations  
- View donation history  
- Upload completion images  
- Toggle notifications  

### 6.2 NGO
- Request donations  
- Schedule pickup  
- Assign volunteers & team leader  
- Update donation status  
- Manage volunteers  
- Handle donation completion  

### 6.3 Volunteer
- Join NGOs  
- Mark availability  
- Get assigned tasks  
- Upload proof  
- View participation history  

### 6.4 Admin
- Default role support for future scalability  

---

## 7. MVC Mapping (Code Synchronization)

### Routes → Controllers → Models

| Route File | Controller | Primary Models |
|------------|------------|----------------|
| auth.routes.js | auth.controller.js | User |
| donation.routes.js | donation.controller.js | Donation, DonationRequest, DonationTeam |
| donor.routes.js | donor.controller.js | DonorProfile |
| ngo.routes.js | ngo.controller.js | NGOProfile, NGORequest |
| volunteer.routes.js | volunteer.controller.js | VolunteerProfile |
| home.routes.js | home.controller.js | Notification |

---

## 8. Core Data Models

### Donation
- Items (Food Items Sub-schema)
- Images
- Status Flow: New → Assigned → Scheduled → Picked → Completed/Failed
- OTP-based pickup verification

### DonationRequest
- Links Donation ↔ NGO ↔ Donor  
- Status: New, Accepted, Rejected, Cancelled  

### DonationTeam
- Assigned Volunteers  
- Pickup & Delivery schedule  
- Completion Proof  

### User
- Authentication via Passport  
- Role-based access  

### DonorProfile / NGOProfile / VolunteerProfile
- Role-specific extended profile data  

### Notification
- Socket-based live updates  
- Permission-aware delivery (notificationsEnabled)  

---

## 9. Middleware Design

### Auth Middleware
- isLoggedIn  
- isDonor  
- isNGO  
- isVolunteer  

### Validation Middleware
- Donation validation (Joi)  
- Donor / NGO / Volunteer profile validation  

### Upload Middleware (Multer)
- Donation images  
- NGO documents  
- Profile pictures  

---

## 10. Helpers & Utilities

### donation.helpers.js
- Food item parsing  
- Image extraction  
- Old image cleanup  
- Donation object construction  

### catchAsync.js
- Prevents repetitive try/catch blocks  

### safeRender.js
- Safe rendering of EJS templates  

### joiSchemas.js
- Centralized validation schemas  

---

## 11. Real-Time Notification System

### Features
- Permission-based notification creation  
- Socket.IO real-time delivery  
- insertMany + single-save hooks  
- Automatic read/unread tracking  

### Flow

Event Trigger → Notification.createIfAllowed()
→ MongoDB Save → Socket Emit → UI Update

---

## 12. Security Design

- Passport-based authentication  
- Role-based route access  
- Joi-based validation  
- ObjectId checks in all schemas  
- Restricted file uploads using Multer  
- Socket emission only to authenticated users  

---

## 13. Donation Workflow

Donor creates → NGO Requests → Donor Approves → NGO Schedules
→ OTP Sent → Volunteer Picks → Proof Uploaded → Donation Completed

---

## 14. Design Strengths

- Strict MVC Layering  
- Centralized Validation  
- Modular Notification System  
- Role-Based Architecture  
- Scalable Real-Time Events  
- Clean Separation of Profiles  

---

## 15. Conclusion

AnnaMitra follows **industrial-grade architecture** with:
- Clean code separation  
- Scalable role-based design  
- Real-time communication  
- Secure authentication & validation  
