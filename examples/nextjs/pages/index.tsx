import { useState, useCallback, useRef, useEffect } from "react";
import AuthnId, {
  VerifyEmailTokenResponse,
  VerifyAuthenticationTokenResponse,
} from "@authn-id/browser";

export default function DemoWeb() {
  const API_KEY = process.env.NEXT_PUBLIC_AUTHNID_API_KEY || "<your-api-key>";

  return (
    <div>
      <p>
        To run this example you must set your API key to <b>API_KEY</b> in
        pages/index.tsx and set your API Secret to <b>API_SECRET</b> in
        pages/api/*.ts files.
      </p>
      <EmailVerification apiKey={API_KEY} />
      <WebAuthnAuthenticator apiKey={API_KEY} />
    </div>
  );
}

function EmailVerification({ apiKey }: { apiKey: string }) {
  const [email, setEmail] = useState("");
  const [logValue, setLogValue] = useState("");

  const log = (log: string) => {
    var newLine = "[" + new Date().toLocaleTimeString() + "]: " + log + "\n";
    setLogValue((prev) => prev + newLine);
  };

  const handleEmailVerification = async () => {
    try {
      log("Starting an email verficiation...");

      const authnId = new AuthnId.Client({ apiKey: apiKey });

      if (!email) {
        log(`Error: please fill in the email address`);
        return;
      }

      log(`An email containing verification link was sent to ${email}`);
      log(`Check your mailbox`);

      const { approved, token } = await authnId.verifyEmail(email);

      log(
        approved
          ? `The user approved the link, token: ${token?.substring(0, 15)}...`
          : `The user denied the link`
      );

      if (approved) {
        const response = await fetch(`/api/verifyEmail?token=${token}`);
        const verified: VerifyEmailTokenResponse = await response.json();
        if (verified.success) {
          log("Successfully verified the email!");
        }

        log("Details: " + JSON.stringify(verified));
        console.log(verified);
      }
    } catch (error) {
      console.error(error);
      log(`Error: check console`);
    }
  };

  return (
    <div>
      <h2>Email Verification</h2>
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      ></input>
      <button onClick={handleEmailVerification}>Verify</button>
      <Log value={logValue}></Log>
    </div>
  );
}

function WebAuthnAuthenticator({ apiKey }: { apiKey: string }) {
  const [username, setUsername] = useState("");
  const [logValue, setLogValue] = useState("");

  const log = (log: string) => {
    var newLine = "[" + new Date().toLocaleTimeString() + "]: " + log + "\n";
    setLogValue((prev) => prev + newLine);
  };

  const handleRegistration = async () => {
    try {
      log("Starting registering...");

      const authnId = new AuthnId.Client({ apiKey: apiKey });

      if (!username) {
        log(`Error: please fill in the username`);
        return;
      }

      const response = await fetch(
        `/api/registerAuthenticator?username=${username}`
      );
      const token = await response.text();
      if (!token) {
        log("Error, can not get a registration token");
        return;
      }

      await authnId.registerAuthenticator(token);

      log("Successfully registered WebAuthn authenticator.");
    } catch (error) {
      console.error(error);
      log(`Error: check console`);
    }
  };

  const handleAuthentication = async () => {
    try {
      log("Starting authentication...");

      const authnId = new AuthnId.Client({ apiKey: apiKey });

      if (!username) {
        log(`Error: please fill in the username`);
        return;
      }

      const token = await authnId.authenticate(username);

      const response = await fetch(`/api/verifyUser?token=${token}`);
      const authenticated: VerifyAuthenticationTokenResponse =
        await response.json();
      if (authenticated.success) {
        log("Successfully authenticated the user.");
        log("Details: " + JSON.stringify(authenticated));
      }
    } catch (error) {
      console.error(error);
      log(`Error: check console`);
    }
  };
  return (
    <div>
      <h2>WebAuthn Authenticator</h2>
      <input
        type="text"
        placeholder="username, email"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      ></input>
      <button onClick={handleRegistration}>Register</button>
      <button onClick={handleAuthentication}>Authenticate</button>
      <Log value={logValue}></Log>
    </div>
  );
}

function Log({ value }: { value: string }) {
  return <pre>{value}</pre>;
}
