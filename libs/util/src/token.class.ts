export class Token {
  public readonly accessToken?: string;
  public readonly refreshToken?: string;

  constructor(token) {
    Object.assign(this, token);
  }
}
