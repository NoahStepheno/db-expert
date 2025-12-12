/**
 * @fileoverview Better Auth CLI Configuration
 *
 * This file is used exclusively by the Better Auth CLI to generate database schemas.
 * DO NOT USE THIS FILE DIRECTLY IN YOUR APPLICATION.
 *
 * This configuration is consumed by the CLI command:
 * `pnpx @better-auth/cli generate --config script/auth-cli.ts --output ../db/src/auth-schema.ts`
 *
 * For actual authentication usage, import from "../src/index.ts" instead.
 */

import { initAuth } from "../src/index";

/**
 * CLI-only authentication configuration for schema generation.
 *
 * @warning This configuration is NOT intended for runtime use.
 * @warning Use the main auth configuration from "../src/index.ts" for your application.
 */
export const auth = initAuth({
  baseUrl: "http://localhost:3000",
  productionUrl: "http://localhost:3000",
  secret: "61657234299196fd6bf629835420e2eb54bd55ace8abd41c9996ef1f2afd2590",
  googleClientId: "1234567890",
  googleClientSecret: "1234567890",
});
