import webpush from "web-push";

// Public key is safe to embed; private key must come from env (Render / .env.local).
const FALLBACK_PUBLIC_KEY =
  "BMkdS08LdUy94SIcVsaaiXzXT8GKRcJSVYBfeMo1p3erDThzEDNpJjP57NEJuLY9YmrL5p87K9pvFub0IsBHymw";

const publicKey =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  process.env.VAPID_PUBLIC_KEY ||
  FALLBACK_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY || "";
const subject = process.env.VAPID_SUBJECT || "mailto:meltin@localhost";

export function getVapidPublicKey() {
  return publicKey;
}

export function assertVapidConfigured() {
  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID keys missing. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.",
    );
  }
}

export function configureWebPush() {
  assertVapidConfigured();
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return webpush;
}
