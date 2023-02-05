import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/typescript-types";

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export interface ApiError {
  code: number;
  message: string;
  httpCode?: number;
}

export interface Response<T> {
  error?: ApiError;
  data?: T;
}

export type FetchOptions = {
  headers?: Record<string, any>;
  body?: Record<string, any>;
};

export interface VerifyEmailResponse {
  approved: boolean | null;
  token?: string;
}

export interface ChallengeEmailItem {
  id: string;
  approved: boolean | null;
}

export interface SubscribeChallengeEmailData {
  challenge_email: ChallengeEmailItem[];
}

export interface EmailBeginResponse {
  challengeId: string;
}

export interface EmailCompleteResponse {
  approved: boolean | null;
  token?: string;
}

export interface WebAuthnRegisterBeginResponse {
  options: PublicKeyCredentialCreationOptionsJSON;
  challengeId: string;
}

export interface WebAuthnRegisterCompleteResponse {
  success: boolean;
  userId: string;
  signinToken: string;
  credentialID: string;
}

export interface WebAuthnAuthenticationBeginResponse {
  options: PublicKeyCredentialRequestOptionsJSON;
}

export interface WebAuthnAuthenticationCompleteResponse {
  success: boolean;
  token: string;
}
