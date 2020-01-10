import { IncomingMessage } from 'http';

export class Header {
  constructor(headers: IncomingMessage) {
    this['X-Refresh-Token'] = headers.headers['x-refresh-token'] as undefined as string;
    this.Authorization = headers.headers.authorization;
  }

  public 'X-Refresh-Token': string;
  public Authorization: string;
}
