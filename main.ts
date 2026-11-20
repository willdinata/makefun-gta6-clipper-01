import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const sourceDirectory = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(sourceDirectory, "VIDEO.json");
const outputDirectory = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDirectory, "VIDEO.json");

async function main() {
  let contents;
  try {
    contents = await readFile(sourcePath);
  } catch (error) {
    const reason =
      error && typeof error === "object" && "code" in error && error.code === "ENOENT"
        ? "file does not exist"
        : error instanceof Error
          ? error.message
          : String(error);
    console.error(`Error: could not read VIDEO.json at ${sourcePath}: ${reason}`);
    process.exitCode = 1;
    return;
  }

  let submission;
  try {
    submission = JSON.parse(contents.toString("utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: VIDEO.json is not valid JSON: ${message}`);
    process.exitCode = 1;
    return;
  }

  if (
    typeof submission !== "object" ||
    submission === null ||
    Array.isArray(submission) ||
    typeof submission.url !== "string" ||
    submission.url.length === 0 ||
    !submission.url.startsWith("https://")
  ) {
    console.error(
      'Error: VIDEO.json must be an object with a non-empty "url" string starting with https://',
    );
    process.exitCode = 1;
    return;
  }

  try {
    await mkdir(outputDirectory, { recursive: true });
    await copyFile(sourcePath, outputPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: could not copy VIDEO.json: ${message}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Copied ${sourcePath} to ${outputPath} (${contents.byteLength} bytes)`);
  console.log(`Handed-in URL: ${submission.url}`);
}

await main();
