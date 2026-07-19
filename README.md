# Materna

Materna is a software-only maternal health coordination app for rural care.
It helps pregnant patients report symptoms, build a pregnancy profile, find
nearby care, activate emergency support, and share information with a linked
doctor dashboard.

This repository intentionally does **not** include a patient-facing watch,
bracelet, or live vitals page yet. Wearable integration can be added later.

## What Materna Does

### Patient Side

- Welcome screen and Patient/Doctor role selection
- Software-first patient home screen
- Materna care chat with safety-focused responses
- Emergency button with countdown before alert activation
- Hospital and emergency-care navigation
- Searchable list of all Arkansas counties
- Patient profile with required fields
- Date of birth picker
- Automatic pregnancy-week advancement
- Patient-approved PDF report generation
- Light and dark mode

### Doctor Side

- Doctor dashboard with clinical overview
- Patient list and patient detail pages
- Emergency alert popup and persistent red alert banner
- Shared report history
- Shared report history for patient records
- Patient contact information
- Doctor profile page

## Important Safety Note

Materna is not a medical device, diagnostic tool, emergency service, or
substitute for clinical care. In an emergency, call 911.

## Tech Stack

- Expo SDK 54
- React Native
- JavaScript and TypeScript
- AsyncStorage
- Expo Location
- Expo Print and Sharing
- React Native Maps
- Express backend

## Getting Started

Install dependencies:

```powershell
npm install
```

Start the app:

```powershell
npx expo start --clear
```

Open the app with Expo Go on a phone.

If the QR code does not work, make sure the phone and computer are on the same
Wi-Fi, then manually open the Expo address shown in the terminal.

## Backend

The project includes an Express API for report sharing, emergency alerts,
doctor sessions, patient history, care-chat responses, and sensor ingest.

```powershell
npm run server
```

Local backend data is saved under `backend/data/`, which is ignored by Git.
Create a local `.env` file from `.env.example` before testing protected doctor
routes:

```powershell
Copy-Item .env.example .env
```

Set a real value for:

```text
MATERNA_DOCTOR_PASSWORD
```

The web app uses `/api` automatically after Vercel deployment. For local Expo
testing, set `EXPO_PUBLIC_MATERNA_API_URL` to your backend URL. For phone
testing with a local backend, use the computer's LAN IP address instead of
`localhost`.

## Deployment

The repository is configured for Vercel:

- Static Expo web app exports to `dist/`
- Express API is exposed through Vercel serverless functions under `/api`
- All non-API routes fall back to `index.html`

Before using the deployed doctor dashboard, set these Vercel environment
variables:

```text
MATERNA_DOCTOR_USER=doctor
MATERNA_DOCTOR_PASSWORD=<strong password>
MATERNA_ALLOWED_ORIGIN=https://your-vercel-domain.vercel.app
```

Do not commit real passwords or patient data.

## Project Structure

```text
App.js
app.json
assets/
backend/
src/
  api/
  components/
  config/
  data/
  screens/
    doctor/
  storage/
  utils/
```

## Main Screens

- `HomeScreen.tsx`: software-first patient overview and care tools
- Materna care chat screen: symptom questions and care guidance
- `emergencyscreen.tsx`: patient emergency activation
- `HospitalsScreen.tsx`: hospital and county navigation
- `profilescreen.tsx`: patient profile and PDF report
- `DoctorWorkspace.tsx`: doctor dashboard

## Software-Only Direction

This version focuses on:

- Symptom reporting
- Risk communication
- Care navigation
- Emergency coordination
- Doctor workflow
- Profile and report sharing

Future wearable work can add:

- Bluetooth pairing
- Bracelet connection status
- Live vital signs
- Sensor-quality checks
- Clinically validated thresholds
- Push notifications and secure backend storage

## Verification

TypeScript check:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit --pretty false
```

Android export check:

```powershell
npx expo export --platform android --output-dir .expo-export-test --clear
```

## License

See `LICENSE`.
