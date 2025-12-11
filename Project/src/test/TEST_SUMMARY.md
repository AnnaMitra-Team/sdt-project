# AnnaMitra – Test Coverage Summary

This document summarizes the testing approach, coverage, and techniques used for the AnnaMitra project.  
The test suite ensures that all major functionalities — authentication, donations, role-based workflows, validation, and notifications — behave correctly and securely.

---

## 🧪 1. Test Frameworks & Tools Used
- **Mocha** – Test runner  
- **Chai (Should style)** – Assertions  
- **Supertest** – API & route testing  
- **Sinon** – Mocking/stubbing (where required)  
- **MongoDB Memory Server** – In-memory isolated database for testing  
- **Chai-HTTP / Supertest** – HTTP request simulation  

---

## 🧩 2. Types of Testing Included

### ✔ 2.1 **Unit Testing**
Tests individual, isolated components without involving routes or Express pipeline.

Covered units include:
- **Notification model methods**  
  - `createIfAllowed()`  
  - `insertManyIfAllowed()`  
- **Helper functions** (e.g., donation helpers — pure logic)
- **Middleware logic** (validation logic can be unit tested independently)

Purpose:
- Verify correctness of **small, independent functions**  
- Ensure helpers behave properly with edge-case inputs  
- Validate internal logic without HTTP calls or full app execution  

---

### ✔ 2.2 **Integration Testing**
Tests multiple layers working together:
- **Routes → Middleware → Controllers → Models → DB**

Examples:
- Full **donation lifecycle** (create → request → approve → schedule → complete)  
- **Volunteer joins NGO**, NGO accepts/rejects  
- **Notification creation**, DB insertion & permission logic  
- **Role-based access flow** (Donor, NGO, Volunteer)

Purpose:
- Validate interactions between system components  
- Confirm workflows behave correctly end-to-end  
- Detect inconsistencies between modules  

---

### ✔ 2.3 **API Testing**
Uses **Supertest** to simulate real HTTP calls to:
- `POST /auth/register`
- `POST /auth/login`
- `POST /donations`
- `GET /donations`
- `GET /ngo`, `/volunteer`, `/donor` dashboards  
- `POST /volunteer/toggle-availability`

Covers:
- Response codes (200, 302, 400, 404)  
- Redirect behavior  
- Body validation & route protection  
- Session & role-based restrictions  

Purpose:
- Ensure API endpoints behave exactly as expected  
- Verify routing + HTTP-layer correctness  
- Validate middleware protections  

---

### ✔ 2.4 **Validation Testing**
Directly checks server-side **Joi schemas** and validation middleware.

Covers:
- Invalid registration inputs  
- Wrong email formats  
- Wrong pincode lengths  
- Missing mandatory donation fields  
- Invalid ObjectId formats  
- Invalid volunteer/NGO profile data  
- OTP & pickup schedule validations  

Purpose:
- Ensure incorrect data is **blocked at the server**  
- Prevent malformed data reaching controllers or database  
- Guarantee consistent schema enforcement  

---

## 🧪 3. Test Coverage Areas

### ✔ Authentication
- Successful donor registration  
- Duplicate email rejection  
- Missing fields  
- Incorrect login credentials  

### ✔ Donation Module
- Donor-only creation  
- Invalid donation handling  
- Unauthorized access protection  
- OTP failure testing  
- Public donation listing  

### ✔ NGO Module
- NGO dashboard access  
- Volunteer join request validation  
- Prevent unauthorized volunteer acceptance/rejection  

### ✔ Volunteer Module
- Dashboard access restrictions  
- Availability toggle protection  
- Role-based routing checks  

### ✔ Notification System
- Permission-based creation  
- Bulk notifications insert  
- Safe handling of blocked notifications  
- Ensures no socket crash in test environment  

---

## 🛡 4. Security-Oriented Tests
- **Role-Based Access Control (RBAC):**  
  Validates that only allowed roles access specific routes.

- **Unauthorized Access Testing:**  
  Ensures non-logged users get redirected.

- **Invalid ObjectId Handling:**  
  Prevents server crash on malformed IDs.

---

## 🧾 5. Summary of Testing Techniques

| Technique | Used For | Purpose |
|----------|----------|---------|
| **Unit Testing** | Models, helpers, middleware | Validate isolated logic |
| **Integration Testing** | Workflows, controllers, DB | Validate combined behavior |
| **API Testing** | Routes, HTTP methods | Validate endpoint correctness |
| **Validation Testing** | Joi schemas, request data | Ensure malformed inputs are rejected |
| **Negative Testing** | Error flows | Ensure stable failure responses |
| **Role-Based Security Testing** | Access control | Ensure proper permissions |
| **Boundary Testing** | Pincode length, string limits | Verify limit behaviors |

---

## ✔ 6. Conclusion

This comprehensive test suite ensures:
- Core functionalities perform correctly  
- Invalid data or unauthorized access is reliably blocked  
- Workflow interactions (NGO–Volunteer–Donor) behave as expected  
- The system is robust, secure, and aligned with project evaluation standards  

