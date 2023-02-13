# Authn-Id Project

This library allows you to easily add **multi-factor authentication** (MFA) or **passwordless signin** to your web application.

- You can simply add an email verification
- You can simply add MFA using fingerprint, Face ID or PIN powered by WebAuthn

[Read the Authn.id documentation](https://docs.authn.id/docs/get-started/firststep)

## Installation

Frontend

```
npm install @authn-id/browser
```

## Email Verification

You can verify an email for multi-factor authentication, user registration or passwordless login.

<img width="717" alt="email_verification" src="https://user-images.githubusercontent.com/2793221/218387075-fd9085e5-1cca-4703-b19f-6144f43d8d45.png">

#### 1. Send a verification link (frontend)

```js
const authnId = new AuthnId.Client({ apiKey: API_KEY });

const email = "johndoe@authn.id";
const { approved, token } = await authnId.verifyEmail(email);

if (approved) {
  const response = await fetch(`/your-backend/verifyEmail?token=${token}`);
  const verified = await response.json();
  if (verified.success) {
    // Success!
  }
}
```

#### 2. Verify a token (backend)

```js
const { token } = req.query;

const response = await fetch(apiUrl + "/verify/token", {
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

<img width="712" alt="webauthn_registration" src="https://user-images.githubusercontent.com/2793221/218387212-246ccfd3-cf3f-431b-83d2-716246407bae.png">

#### 1. Retrieve a registration token (backend)

```js
const body = {
  userId: "1234567",
  username: "johndoe@authn.id",
  displayName: "John Doe",
};

const response = await fetch(apiUrl + "/register/authenticator", {
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
const authnId = new AuthnId.Client({ apiKey: API_KEY });

const response = await fetch("/your-backend/registerAuthenticator");
const token = await response.text();

try {
  await authnId.registerAuthenticator(token);
  // Success!
} catch (e) {
  // Error
}
```

### Authentication

<img width="721" alt="webauthn_authentication" src="https://user-images.githubusercontent.com/2793221/218387236-4d9c7844-d763-4175-b298-40edb9670624.png">

#### 1. Start the authentication (frontend)

```js
const authnId = new AuthnId.Client({ apiKey: API_KEY });

const username = "johndoe@authn.id";
const token = await authnId.authenticate(username);

const response = await fetch(`/your-backend/verifyUser?token=${token}`);
const authenticated = await response.json();
if (authenticated.success) {
  // Success!
}
```

#### 2. Verify the token (backend)

```js
const { token } = req.query;

const response = await fetch(apiUrl + "/verify/token", {
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
const apiUrl = "https://api.authn.id/v1";
```
