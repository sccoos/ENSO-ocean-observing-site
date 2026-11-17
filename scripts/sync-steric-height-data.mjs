import { access, mkdir, rename, writeFile } from "node:fs/promises";

const sourceUrl = "https://spraydata.ucsd.edu/products/el-nino/data/stericheight_indices.json";
const destination = "public/data/stericheight_indices.json";
const temporaryDestination = `${destination}.tmp`;
const requiredSeries = ["stericheight_66", "stericheight_80", "stericheight_90"];

function validate(data) {
  for (const key of requiredSeries) {
    const series = data?.[key];

    if (
      !series ||
      !Array.isArray(series.time) ||
      !Array.isArray(series.steric_height) ||
      !Array.isArray(series.roni) ||
      series.time.length !== series.steric_height.length ||
      series.time.length !== series.roni.length
    ) {
      throw new Error(`Unexpected steric-height data format for ${key}.`);
    }
  }
}

try {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  validate(data);

  await mkdir("public/data", { recursive: true });
  await writeFile(temporaryDestination, `${JSON.stringify(data)}\n`);
  await rename(temporaryDestination, destination);
  console.log(`Updated ${destination}.`);
} catch (error) {
  try {
    await access(destination);
    console.warn(`Could not refresh steric-height data (${error.message}). Using the existing copy.`);
  } catch {
    throw error;
  }
}
