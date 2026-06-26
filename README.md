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
- AI symptom chat with safety-focused fallback responses
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
- Sample reports for demo patients
- Patient contact information
- Doctor profile page

## Important Safety Note

Materna is a prototype. It is not a medical device, diagnostic tool, emergency
service, or substitute for clinical care. In an emergency, call 911.

## Tech Stack

- Expo SDK 54
- React Native
- JavaScript and TypeScript
- AsyncStorage
- Expo Location
- Expo Print and Sharing
- React Native Maps
- Express demo backend

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

The project includes a simple local backend:

```powershell
node backend/server.js
```

The app API URL is configured in:

```text
src/config/config.js
```

For phone testing with a local backend, use the computer's LAN IP address
instead of `localhost`.

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
- `AIChatScreen.tsx`: symptom assistant
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
