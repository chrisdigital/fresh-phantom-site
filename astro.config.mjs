/**
 * Astro configuration for Fresh Phantom Labs marketing site.
 * Deploys to Cloudflare Pages with server-side API routes (Resend contact form).
 */
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
});
