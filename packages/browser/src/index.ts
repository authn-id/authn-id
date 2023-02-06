import { Client } from "./authnid";

export * from "./authnid";
export {
  isPlatformAuthenticatorAvailable,
  isAuthenticatorInstalled,
} from "./platform";
export type {
  VerifyEmailResponse,
  VerifyEmailTokenResponse,
  VerifyAuthenticationTokenResponse,
} from "./types";

const AuthnId = { Client };
export default AuthnId;
