# Authn-Id Project

This library allows you to easily add **multi-factor authentication** (MFA) or **passwordless signin** to your web application.

- You can simply add an email verification
- You can simply add MFA using fingerprint, Face ID or PIN powered by WebAuthn

## Installation

Frontend

```
npm install @authn-id/browser
```

## Email Verification

You can verify an email for multi-factor authentication, user registration or passwordless login.

#### 1. Send a verification link (frontend)

```js
const authnid = new AuthnId.Client({ apiKey: API_KEY });

const email = "johndoe@authn.id";
const { approved, token } = await authnid.verifyEmail(email);

if (approved) {
  const verified = await fetch(`/your-backend/verifyEmail?token=${token}`);
  if (verified.success) {
    // Success!
  }
}
```

#### 2. Verify a token (backend)

```js
const { token } = req.query;

const response = await fetch(apiurl + "/verify/token", {
  method: "POST",
  body: token,
  headers: { "x-authnid-api-secret": API_SECRET, "Content-Type": "text/plain" },
});

var result = await response.json();
if (result.success) {
  // Success!
}
```

## WebAuthn (Passkeys)

You can verify a user with platform authenticator for MFA or passwordless signin.

- Windows: Fingerprint, Facial recognition or PIN (Windows Hello)
- Mac & iOS: Touch ID or Face ID
- Android: fingerprint, face or screen lock

### Registration

#### 1. Retrieve a registration token (backend)

```js
const body = {
  userId: "1234567",
  username: "johndoe@authn.id",
  displayName: "John Doe",
};

const response = await fetch(apiurl + "/register/authenticator", {
  method: "POST",
  body: JSON.stringify(body),
  headers: {
    "x-authnid-api-secret": API_SECRET,
    "Content-Type": "application/json",
  },
});

const token = await response.text();
```

#### 2. Initiate the registration (frontend)

```js
const authnid = new AuthnId.Client({ apiKey: API_KEY });

const response = await fetch("/your-backend/register/authenticator");
const token = await response.text();

try {
  await authnid.registerAuthenticator(token);
  // Success!
} catch (e) {
  // Error
}
```

### Authentication

#### 1. Start the authentication (frontend)

```js
const authnid = new AuthnId.Client({ apiKey: API_KEY });

const username = "johndoe@authn.id";
const token = await authnid.authenticate(username);

const authenticated = await fetch(`/your-backend/verifyUser?token=${token}`);
if (authenticated.success) {
  // Success!
}
```

#### 2. Verify the token (backend)

```js
const { token } = req.query;

const response = await fetch(apiurl + "/verify/token", {
  method: "POST",
  body: token,
  headers: { "x-authnid-api-secret": API_SECRET, "Content-Type": "text/plain" },
});

var result = await response.json();
if (result.success) {
  // Success!
}
```

## Common

#### Frontend

```js
import AuthnId from "@authn-id/browser";
```

#### Backend

```js
const apiUrl = "https://api.authnid.dev/v1";
```
