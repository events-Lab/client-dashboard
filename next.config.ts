import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  transpilePackages: ["@events-lab/shared-components"],
  outputFileTracingRoot: path.resolve(appDir, ".."),
  turbopack: {
    root: path.resolve(appDir, ".."),
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
