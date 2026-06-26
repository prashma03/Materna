import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { ProfileData } from "../storage/profileStorage";
import { SensorData } from "../data/sampleSensorData";
import { MaternalRiskAssessment } from "./maternalRiskAssessment";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function display(value: string) {
  return escapeHtml(value.trim() || "Not provided");
}

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

async function getLogoDataUri() {
  const asset = Asset.fromModule(
    require("../../assets/materna-app-icon.png")
  );
  await asset.downloadAsync();
  const uri = asset.localUri || asset.uri;
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:image/png;base64,${base64}`;
}

export async function createAndShareProfileReport(
  profile: ProfileData,
  sensorData: SensorData,
  earlyRiskAssessment?: MaternalRiskAssessment
) {
  const logoDataUri = await getLogoDataUri();
  const conditions = [
    ["History of miscarriage", profile.hasMiscarriage],
    ["High blood pressure", profile.hasHighBP],
    ["Diabetes", profile.hasDiabetes],
    ["Anemia", profile.hasAnemia],
    ["Previous C-section", profile.hasCSection],
  ];

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: Arial, sans-serif; color: #172033; padding: 32px; }
          h1 { color: #172033; margin: 0; font-size: 28px; letter-spacing: 2px; }
          .brand { display: flex; align-items: center; gap: 14px; }
          .logo { width: 62px; height: 62px; border-radius: 14px; }
          .subtitle { color: #64748b; margin: 6px 0 24px; }
          .report-date { color: #64748b; font-size: 11px; margin-top: 4px; }
          .section { margin-top: 20px; }
          .section-title { color: #16a34a; font-size: 13px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #dbe2ea; padding-bottom: 7px; }
          .grid { display: flex; flex-wrap: wrap; }
          .item { width: 48%; margin: 8px 2% 8px 0; }
          .label { color: #64748b; font-size: 11px; }
          .value { font-size: 14px; font-weight: bold; margin-top: 2px; }
          .vitals { display: flex; flex-wrap: wrap; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 10px; }
          .vital { width: 31%; margin: 7px 2% 7px 0; }
          .risk { color: ${sensorData.risk.color}; font-weight: bold; }
          .notice { margin-top: 28px; padding: 12px; background: #eef2ff; font-size: 10px; color: #475569; }
          .early-risk { border: 1px solid ${earlyRiskAssessment?.color || "#dbe2ea"}; background: #fff7f8; padding: 12px; border-radius: 10px; }
          .early-risk-title { color: ${earlyRiskAssessment?.color || "#172033"}; font-size: 15px; font-weight: bold; }
          .reason { font-size: 12px; margin-top: 6px; }
        </style>
      </head>
      <body>
        <div class="brand">
          <img class="logo" src="${logoDataUri}" />
          <div>
            <h1>MATERNA</h1>
            <div class="subtitle">Maternal health and bracelet report</div>
            <div class="report-date">Report date: ${escapeHtml(new Date().toLocaleDateString())}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Patient and pregnancy</div>
          <div class="grid">
            <div class="item"><div class="label">Name</div><div class="value">${display(profile.fullName)}</div></div>
            <div class="item"><div class="label">Date of birth</div><div class="value">${display(profile.dateOfBirth)}</div></div>
            <div class="item"><div class="label">County</div><div class="value">${display(profile.county)}</div></div>
            <div class="item"><div class="label">Age</div><div class="value">${display(profile.age)}</div></div>
            <div class="item"><div class="label">Pregnancy week</div><div class="value">${display(profile.pregnancyWeek)}</div></div>
            <div class="item"><div class="label">Weight</div><div class="value">${display(profile.weightLbs)} lbs</div></div>
            <div class="item"><div class="label">Height</div><div class="value">${display(profile.heightFt)} ft ${display(profile.heightIn)} in</div></div>
            <div class="item"><div class="label">Previous pregnancies</div><div class="value">${display(profile.previousPregnancies)}</div></div>
          </div>
        </div>

        ${
          earlyRiskAssessment
            ? `<div class="section early-risk">
                <div class="early-risk-title">Early risk review: ${escapeHtml(earlyRiskAssessment.level)}</div>
                ${
                  earlyRiskAssessment.reasons.length
                    ? earlyRiskAssessment.reasons
                        .map((reason) => `<div class="reason">• ${escapeHtml(reason)}</div>`)
                        .join("")
                    : `<div class="reason">No profile or chat risk factors identified.</div>`
                }
                <div class="label" style="margin-top: 10px">${escapeHtml(earlyRiskAssessment.disclaimer)}</div>
              </div>`
            : ""
        }

        <div class="section">
          <div class="section-title">Current bracelet snapshot</div>
          <div class="item"><div class="label">Bracelet status</div><div class="value">${sensorData.bracelet.connected ? "Connected" : "Disconnected"} · ${sensorData.bracelet.battery}% battery · Synced ${display(sensorData.bracelet.lastSynced)}</div></div>
          <div class="vitals">
            ${Object.values(sensorData.vitals)
              .map(
                (vital) =>
                  `<div class="vital"><div class="label">${escapeHtml(vital.title)}</div><div class="value">${escapeHtml(vital.value)} ${escapeHtml(vital.unit)}</div></div>`
              )
              .join("")}
          </div>
          <div class="item"><div class="label">Materna risk status</div><div class="value risk">${escapeHtml(sensorData.risk.level)} · ${escapeHtml(sensorData.risk.message)}</div></div>
          <div class="item"><div class="label">Current assessment</div><div class="value">${escapeHtml(sensorData.risk.description)}</div></div>
        </div>

        <div class="section">
          <div class="section-title">Medical history</div>
          <div class="grid">
            ${conditions
              .map(
                ([label, value]) =>
                  `<div class="item"><div class="label">${label}</div><div class="value">${yesNo(Boolean(value))}</div></div>`
              )
              .join("")}
          </div>
          <div class="item"><div class="label">Current medications</div><div class="value">${display(profile.medications)}</div></div>
        </div>

        <div class="section">
          <div class="section-title">Emergency and care</div>
          <div class="item"><div class="label">Emergency contact</div><div class="value">${display(profile.emergencyContact)}</div></div>
          <div class="item"><div class="label">Preferred hospital or clinic</div><div class="value">${display(profile.preferredHospital)}</div></div>
        </div>

        <div class="notice">
          Last updated: ${profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "Not recorded"}.
          This patient-entered summary supports care coordination and is not a diagnosis or substitute for a clinician's medical record.
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Share Materna health profile",
      UTI: "com.adobe.pdf",
    });
  }
  return uri;
}
