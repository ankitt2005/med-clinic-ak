# AuraCare - Medical Clinic Platform

AuraCare is a premium, full-featured clinical management and telehealth platform built using **Next.js 16**, **Tailwind CSS v4**, **Framer Motion**, **Firebase**, and **Stripe**. 

It provides an end-to-end flow for patients to register, browse specialists, book consultations, pay securely via Stripe, and view their dashboard. It also includes an advanced Admin panel for clinic administrators to manage appointments, view statistics, and review patient metrics.

---

## 🌟 Key Features

- **Patient Experience**:
  - Secure authentication (Sign up/Sign in) powered by Firebase Auth.
  - Interactive specialty filtering (General Medicine, Cardiology, Neurology, Pediatrics, Dermatology, Orthopedics).
  - 36 pre-configured medical specialists with ratings, experience, and custom scheduling availability.
  - Seamless appointment booking with dynamic date and time slot validation.
  - Fully integrated Stripe checkout gateway for consultation booking fees.
  - Patient dashboard showing upcoming appointments, history, clinic messages, and medical metrics.
  
- **Admin Dashboard**:
  - Overview cards: Total Bookings, Gross Revenue, Active Patients, and Pending Approvals.
  - Live charts detailing booking trends and revenue distribution using Recharts.
  - Interactive appointment manager: View details, update statuses, or cancel appointments.
  
- **Technical Capabilities**:
  - Auto-seeding database system: Checks Firestore collections on start and populates doctors and services automatically.
  - Fully responsive premium dark-themed UI with fluid page transitions and hover animations.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v18.x or higher)
- **npm** or **yarn** or **pnpm**
- **Git**

You also need:
1. A **Firebase Project** (with Firebase Authentication and Firestore Database enabled).
2. A **Stripe Account** (in Test Mode to obtain API keys).

---

## 🚀 Setup & Installation

### 1. Clone the Project
Open your terminal and navigate to the project directory:
```bash
cd Med_Clinic_AK/src
```

### 2. Install Dependencies
Run the install command to get all required packages:
```bash
npm install
```

### 3. Configure Environment Variables
Create a file named `.env.local` in the root of the `src` directory (you can copy `.env.example` as a starting template):
```bash
cp .env.example .env.local
```

Fill in your configuration details inside `.env.local`:
```env
# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Stripe Gateway Credentials
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🗄️ Database (Firebase / Firestore) Integration

AuraCare stores all doctors, services, users, and appointment bookings inside Firestore.

### How to configure Firestore:
1. Go to the **Firebase Console** and open your project.
2. Select **Firestore Database** in the left menu, then click **Create Database**.
3. Choose **Start in Test Mode** (for developmental convenience, though update rules for production).
4. Select your database location and click **Enable**.
5. Enable **Authentication** in the Firebase console and toggle on the **Email/Password** sign-in provider.

### Automated Database Seeding:
When the application starts, it automatically triggers a database check from `src/lib/seed.ts`. If the `doctors` or `services` collections are empty or missing records:
* It will seed the database with **36 medical doctors** categorized across 6 departments.
* It will populate the **6 clinical services** with pricing and durations.
* No manual database imports are necessary.

---

## 💳 Payment Gateway (Stripe) Integration

Consultation fees are paid securely via Stripe Checkout sessions.

### How to set up Stripe:
1. Create a free developer account at [Stripe.com](https://stripe.com).
2. Ensure you are in **Test Mode** (toggle in the top-right of the dashboard).
3. Go to the **Developers** tab and select **API keys**.
4. Copy your **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`) and add them to your `.env.local` file.
5. When booking an appointment on the site:
   - Clicking **Confirm and Pay** requests a checkout session from `/api/checkout`.
   - The user is redirected to Stripe's secure checkout.
   - Upon successful payment, Stripe redirects the user back to `/booking/success`, where the appointment is officially recorded in the Firestore database.
   - For testing, use Stripe's test credit card number: `4242 4242 4242 4242` with any future expiry date and a random 3-digit CVC.

---

## 💻 Running the App

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Production Build & Launch
Validate and build the bundle for production optimization:
```bash
npm run build
npm run start
```

---

## 📁 Project Directory Structure
```text
src/
├── src/
│   ├── app/           # App router pages, layouts, and API routes
│   │   ├── admin/     # Admin panel (Analytics, metrics, and logs)
│   │   ├── api/       # Next.js API routes (e.g. Stripe checkout sessions)
│   │   ├── auth/      # Sign-in and Sign-up authentication pages
│   │   ├── booking/   # Doctor reservation page and booking success confirmation
│   │   └── dashboard/ # Patient dashboard and medical records
│   ├── context/       # Auth state providers
│   ├── firebase/      # Firestore and Firebase Auth client-side configurations
│   └── lib/           # Helper scripts (including Database Seeding script)
├── public/            # Static assets (icons, images)
├── .env.example       # Template for local environment configs
├── tsconfig.json      # TypeScript compiler settings
└── package.json       # Project scripts and library dependencies
```
