import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/typescript-types";
import { createClient } from "graphql-ws";
import { saveAuthenticator } from "./platform";
import {
  AtLeast,
  Response,
  FetchOptions,
  VerifyEmailResponse,
  ChallengeEmailItem,
  SubscribeChallengeEmailData,
  EmailBeginResponse,
  EmailCompleteResponse,
  WebAuthnRegisterBeginResponse,
  WebAuthnRegisterCompleteResponse,
  WebAuthnAuthenticationBeginResponse,
  WebAuthnAuthenticationCompleteResponse,
} from "./types";

export interface Config {
  apiUrl: string;
  graphqlUrl: string;
  apiKey: string;
  origin: string;
  hostname: string;
}

export class Client {
  private config: Config = {
    apiUrl: "https://api.authn.id/v1",
    graphqlUrl: "wss://authn-id.hasura.app/v1/graphql",
    apiKey: "",
    origin: window.location.origin,
    hostname: window.location.hostname,
  };

  constructor(config: AtLeast<Config, "apiKey">) {
    Object.assign(this.config, config);
  }

  public async verifyEmail(
    email: string,
    userDisplayName?: string
  ): Promise<VerifyEmailResponse> {
    const challengeId = await this.beginEmailVerification(
      email,
      userDisplayName
    );
    await this.waitForUserEmailVerification(challengeId);
    const { approved, token } = await this.completeEmailVerification(
      challengeId
    );
    return { approved, token };
  }

  private async beginEmailVerification(
    email: string,
    displayName?: string
  ): Promise<string> {
    const { challengeId } = await this.fetchAPI<EmailBeginResponse>(
      "/email/begin",
      "post",
      { body: { email, displayName } }
    );
    return challengeId;
  }

  private async completeEmailVerification(
    challengeId: string
  ): Promise<EmailCompleteResponse> {
    const { approved, token } = await this.fetchAPI<EmailCompleteResponse>(
      "/email/complete",
      "post",
      { body: { challengeId } }
    );

    return { approved, token };
  }

  private async waitForUserEmailVerification(
    challengeId: string
  ): Promise<ChallengeEmailItem> {
    return new Promise(async (resolve, reject) => {
      try {
        const query = `subscription { 
          challenge_email(where: {id: {_eq: "${challengeId}"}}) {
            approved
            id
          }
        }`;

        const handleApproval = ({
          challenge_email,
        }: SubscribeChallengeEmailData): "stop" | "continue" => {
          if (!challenge_email || !challenge_email[0]) {
            reject();
            return "stop";
          }
          const current = challenge_email[0];
          if (current.approved === true || current.approved === false) {
            resolve(current);
            return "stop";
          }
          return "continue";
        };

        await this.subscribeGraphql(
          query,
          { "x-authnid-challenge-id": challengeId },
          handleApproval
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  public async registerAuthenticator(token: string): Promise<string> {
    const response = await this.beginWebAuthnRegister(token);
    const { success, userId, signinToken } =
      await this.completeWebAuthnRegister(token, response);
    if (!success) {
      throw Error("Failed to register");
    }

    saveAuthenticator(userId);
    return signinToken;
  }

  private async beginWebAuthnRegister(
    token: string
  ): Promise<RegistrationResponseJSON> {
    const { options } = await this.fetchAPI<WebAuthnRegisterBeginResponse>(
      "/webauthn/register/begin",
      "post",
      {
        body: {
          token: token,
          hostname: this.config.hostname,
        },
      }
    );

    try {
      const webAuthnResponse = await startRegistration(options);
      return webAuthnResponse;
    } catch (error: any) {
      if (error.name === "InvalidStateError") {
        saveAuthenticator(options.user.id);
      }
      throw error;
    }
  }

  private async completeWebAuthnRegister(
    token: string,
    response: RegistrationResponseJSON
  ): Promise<WebAuthnRegisterCompleteResponse> {
    const data = await this.fetchAPI<WebAuthnRegisterCompleteResponse>(
      "/webauthn/register/complete",
      "post",
      {
        body: {
          token: token,
          webauthnResponse: response,
          origin: this.config.origin,
          hostname: this.config.hostname,
        },
      }
    );

    return data;
  }

  public async authenticate(username: string): Promise<string> {
    const webAuthnResponse = await this.beginWebAuthnAuthentication(username);
    const { token } = await this.completeWebAuthnAuthentication(
      username,
      webAuthnResponse
    );
    return token;
  }

  private async beginWebAuthnAuthentication(
    username: string
  ): Promise<AuthenticationResponseJSON> {
    const { options } =
      await this.fetchAPI<WebAuthnAuthenticationBeginResponse>(
        "/webauthn/authentication/begin",
        "post",
        {
          body: {
            username: username,
            hostname: window.location.hostname,
          },
        }
      );

    return await startAuthentication(options);
  }

  private async completeWebAuthnAuthentication(
    username: string,
    webAuthnResponse: any
  ): Promise<WebAuthnAuthenticationCompleteResponse> {
    const data = await this.fetchAPI<WebAuthnAuthenticationCompleteResponse>(
      "/webauthn/authentication/complete",
      "post",
      {
        body: {
          username: username,
          origin: window.location.origin,
          hostname: window.location.hostname,
          webauthnResponse: webAuthnResponse,
        },
      }
    );

    return data;
  }

  private async subscribeGraphql(
    query: string,
    headers: Record<string, string>,
    onReceive: (data: any) => "continue" | "stop"
  ) {
    const client = createClient({
      url: this.config.graphqlUrl,
      connectionParams: () => ({ headers: { ...headers } }),
    });

    let unsubscribe = () => {};

    const onNext = ({ data }: { data: any }) => {
      if (onReceive(data) === "stop") {
        unsubscribe();
      }
    };

    return new Promise((resolve, reject) => {
      unsubscribe = client.subscribe(
        { query },
        {
          next: onNext,
          error: reject,
          complete: resolve as () => {},
        }
      );
    });
  }

  private async fetchAPI<T>(
    path: string,
    method: "get" | "post" | "put" = "get",
    options?: FetchOptions
  ): Promise<T> {
    const response = await fetch(`${this.config.apiUrl}${path}`, {
      method: method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        "x-authnid-api-key": this.config.apiKey,
      },
      body: options?.body && JSON.stringify(options?.body),
    });

    const { error, data } = (await response.json()) as Response<T>;
    if (error) {
      throwError(error.code, error.message);
    }
    return data as T;
  }
}

function throwError(code: number, message: string) {
  throw { code, message };
}
