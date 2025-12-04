# CommunityConnect - Smart Society Management

A full-stack web/mobile blueprint for gated communities, featuring Resident, Guard, and Admin workflows with AI assistance.

## 📱 Features

1.  **Residents**: 
    - Pre-approve visitors (generates entry code).
    - View and pay bills (maintenance/amenities).
    - **AI Assistant**: Chat with Gemini to ask about rules, timings, or summarize notice board updates.
2.  **Security Guard**:
    - Fast check-in/out for visitors using codes.
    - View "Expected Today" list.
3.  **Admin**:
    - Dashboard with payment and visitor analytics.
    - Activity logs.

## 🛠 Tech Stack

-   **Frontend**: React 18, TypeScript, Tailwind CSS
-   **Routing**: React Router (HashRouter)
-   **Icons**: Lucide React
-   **Charts**: Recharts
-   **AI**: Google Gemini API (`@google/genai`)
-   **Backend (Simulated)**: Structure reflects Firebase (Auth, Firestore) patterns.

## 🚀 Getting Started

### 1. Installation

```bash
npm install
# or
yarn install
```

### 2. Configure Environment

To enable real AI features, create a `.env` file in the root (if using a build tool like Vite) or configure your environment variables:

```
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

*Note: The current code checks `process.env.API_KEY` for the backend logic simulation.*

### 3. Run

```bash
npm start
```

## 🏗 Architecture Blueprint

### Data Models (Firestore Schema)

*   `users/{uid}`: Profile data, role (resident/guard/admin), flat details.
*   `visitors/{visitorId}`:
    *   `code`: 4-digit entry code.
    *   `hostId`: Reference to resident.
    *   `status`: 'pre_approved' | 'entered' | 'exited'.
    *   `logs`: Array of timestamps.
*   `payments/{paymentId}`:
    *   `amount`: Number.
    *   `dueDate`: Timestamp.
    *   `status`: 'paid' | 'pending'.
*   `notices/{noticeId}`: Community announcements.

### Access Control (Security Rules)

*   **Residents**: Read/Write own data; Read public notices.
*   **Guards**: Read/Update `visitors` collection (check-in/out). Cannot access financial data.
*   **Admins**: Full access.

### AI Integration
*   **Summarization**: Fetches latest notices from DB -> Sends prompt to Gemini -> Displays summary.
*   **Q&A**: Feeds "System Prompt" with community rules (hardcoded or fetched from DB) -> Gemini answers user queries contextually.

## 🔮 Future Extensions

1.  **Hardware**: Integrate QR scanner in Guard view.
2.  **IoT**: Connect to boom barriers via Raspberry Pi + Cloud Functions.
3.  **Payments**: Replace stub with Razorpay/Stripe integration.
