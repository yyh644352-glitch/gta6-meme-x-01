import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// A valid entry is one X post: https://x.com/<handle>/status/<digits>.
// The handle is letters, digits and underscores; the status id is digits only.
const POST_URL_RE = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/[0-9]+$/;

function fail(message: string): never {
  console.error(`invalid POST.json: ${message}`);
  process.exit(1);
}

try {
  const postPath = join(botDir, "POST.json");
  let post: unknown;
  try {
    post = JSON.parse(readFileSync(postPath, "utf8"));
  } catch (err) {
    fail(`could not read or parse ${postPath}: ${(err as Error).message}`);
  }

  const url = (post as { url?: unknown } | null)?.url;
  if (typeof url !== "string") {
    fail(`"url" is missing or not a string (got ${url === undefined ? "missing" : typeof url})`);
  }
  if (!POST_URL_RE.test(url)) {
    fail(
      `url ${JSON.stringify(url)} is not a valid X post URL; ` +
        `expected https://x.com/<handle>/status/<digits> (handle: letters, digits, underscore; id: digits only)`
    );
  }

  mkdirSync(outputDir, { recursive: true });
  copyFileSync(postPath, join(outputDir, "POST.json"));
  console.log(`copied post ${url}`);
} catch (err) {
  console.error(`failed to copy POST.json: ${(err as Error).message}`);
  process.exit(1);
}
