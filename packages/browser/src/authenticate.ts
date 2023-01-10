export class AuthnId {
  private apikey: string;

  constructor({ apikey }: { apikey: string }) {
    this.apikey = apikey;
  }

  public async authenticate({ email }: { email: string }) {
    console.log("authenticate by email", email);
  }

  public async verify() {
    console.log("verify");
  }
}
