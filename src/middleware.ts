/**
 * Astro middleware — runs on every request via Cloudflare Pages.
 * Redirects naked domain (freshphantom.com) to www.freshphantom.com.
 */
import { defineMiddleware } from "astro:middleware";

const NAKED_DOMAIN = "freshphantom.com";
const WWW_DOMAIN = "www.freshphantom.com";

export const onRequest = defineMiddleware(({ request }, next) => {
  const url = new URL(request.url);

  if (url.hostname === NAKED_DOMAIN) {
    url.hostname = WWW_DOMAIN;
    return Response.redirect(url.toString(), 301);
  }

  return next();
});
