import { IncomingMessage } from 'http';

export class Header {
  public readonly token = null;

  constructor(headers: IncomingMessage) {
    if (headers.headers['x-refresh-token']) {
      this.token = headers.headers['x-refresh-token'] as undefined as string;
    } else if (headers.headers.authorization) {
      this.token = headers.headers.authorization;
    }
  }
}
