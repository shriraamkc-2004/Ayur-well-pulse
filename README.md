# Ayur-Well Pulse: Ayurvedic Diet Management SaaS

Ayur-Well Pulse is a production-ready, multi-tenant Ayurvedic Diet Management SaaS platform. It features robust privacy controls, clinic-practitioner-patient relationships, consent-based data access, and an advanced diet planning system.

## 🚀 Running the Project

To run the full application locally, you need to start both the backend server and the frontend development server.

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or a cloud URI)
- pnpm (Recommended) or npm

### 1. Backend Setup
The backend is located in the `server` directory.

```sh
# Navigate to server directory
cd server
# Install dependencies
pnpm install  # or npm install

# Create/Configure .env
# Ensure you have MONGODB_URI and JWT_SECRET set.

# Start the server
node index.js
```
The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
The frontend is located in the root directory.

```sh
# Navigate to the root directory
cd ..

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend will run on `http://localhost:8080`.

---

## 🛡️ Security & Compliance
This platform is built with strict health data privacy standards (PRD Phase 1 compliant):
- **AES-256-GCM Encryption**: Sensitive PII (AYUSH IDs, lifestyle notes) is encrypted at rest.
- **Pseudonymization**: Patients interact via `pseudoId` for external visibility.
- **Consent Enforcement**: Relationship-based visibility and granular consent for records and messaging.

### Running Security Audit
To verify encryption and pseudonymization logic:
```sh
cd server
node verify_logic.js
```

---

## 📄 Documentation
- **API Reference**: Detailed endpoint documentation is available in the [api_reference.md](.gemini/antigravity/brain/5efd93b7-4d30-4fd7-ac08-d19b021d02be/api_reference.md) artifact.
- **Phase 1 Walkthrough**: Detailed implementation details and screenshots in [walkthrough.md](.gemini/antigravity/brain/5efd93b7-4d30-4fd7-ac08-d19b021d02be/walkthrough.md).

---

## 🛠️ Tech Stack
- **Frontend**: React, Vite, TypeScript, shadcn/ui, Tailwind CSS.
- **Backend**: Node.js, Express, Mongoose.
- **Database**: MongoDB.
- **Security**: AES-256-GCM, JWT, RBAC.
