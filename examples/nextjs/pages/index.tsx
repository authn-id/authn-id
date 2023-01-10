import { useRef } from "react";
import { AuthnId } from "@authn-id/browser";

const authnid = new AuthnId({ apikey: "my-secret-vlaue" });

export default function Web() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passcodeRef = useRef<HTMLInputElement>(null);

  const sendCode = () => {
    if (emailRef.current) {
      authnid.authenticate({ email: emailRef.current.value });
    }
  };

  const verifyCode = () => {
    if (passcodeRef.current) {
      authnid.authenticate({ email: passcodeRef.current.value });
    }
  };

  return (
    <div>
      <h1>2-Step Verification</h1>
      <input ref={emailRef} placeholder="email"></input>
      <button onClick={sendCode}>Send Code</button>
      <p></p>
      <input ref={passcodeRef} placeholder="passcode"></input>
      <button onClick={verifyCode}>Verify Code</button>
    </div>
  );
}
