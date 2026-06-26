function calculateRisk(data) {
  let score = 0;

  if (data.age < 18 || data.age > 35) score += 2;
  if (data.weeks >= 30) score += 1;
  if (data.transportation === "no") score += 3;
  if (data.provider === "no") score += 2;
  if (data.complications === "yes") score += 2;
  if (data.miles > 45) score += 2;

  if (data.headache === "yes") score += 1;
  if (data.dizziness === "yes") score += 1;
  if (data.swelling === "yes") score += 2;
  if (data.baby === "no") score += 4;

  let level = "LOW";

  if (score >= 8) {
    level = "HIGH";
  } else if (score >= 4) {
    level = "MODERATE";
  }

  return {
    score,
    level,
  };
}

module.exports = calculateRisk;