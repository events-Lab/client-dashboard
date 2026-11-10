import { existsSync } from "node:fs";
import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const parentDir = path.resolve(appDir, "..");
const nextInParent = existsSync(path.join(parentDir, "node_modules", "next", "package.json"));
const sharedSibling = existsSync(path.join(parentDir, "shared-compoenents", "package.json"));
const turbopackRoot = nextInParent ? parentDir : appDir;
const tracingRoot = sharedSibling || nextInParent ? parentDir : appDir;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  transpilePackages: ["@events-lab/shared-components"],
  outputFileTracingRoot: tracingRoot,
  turbopack: {
    root: turbopackRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
        condition: {
          all: [{ not: "foreign" }, { not: { path: "**/*.module.css" } }],
        },
      },
    },
  },
};

export default nextConfig;
