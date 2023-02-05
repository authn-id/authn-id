import { platformAuthenticatorIsAvailable } from "@simplewebauthn/browser";

export async function isPlatformAuthenticatorAvailable() {
  return await platformAuthenticatorIsAvailable();
}

export function isAuthenticatorInstalled(userId: string) {
  const authenticators = loadAuthenticator();
  return authenticators.length > 0;
}

const storageUserIds = "authnid.userIds";

export function saveAuthenticator(userId: string) {
  if (!userId) return;

  const updated = loadAuthenticator();
  updated.push(userId);
  localStorage.setItem(storageUserIds, JSON.stringify(updated));
}

function loadAuthenticator() {
  return JSON.parse(localStorage.getItem(storageUserIds) || "[]");
}
