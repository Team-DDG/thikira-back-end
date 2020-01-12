import { IncomingMessage } from 'http';
import { TokenTypeEnum } from './token-type.enum';

export class Header {
  public readonly token: string = null;
  public readonly type: TokenTypeEnum;

  constructor(headers: IncomingMessage) {
    if (headers.headers['x-refresh-token']) {
      this.token = headers.headers['x-refresh-token'] as undefined as string;
      this.type = TokenTypeEnum.refresh;
    } else if (headers.headers.authorization) {
      this.token = headers.headers.authorization;
      this.type = TokenTypeEnum.access;
    }
  }

  public isEmpty(): boolean {
    return !this.token;
  }
}
