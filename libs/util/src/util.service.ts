import { config } from '@app/config';
import { Header } from '@app/type';
import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class UtilService {
  private readonly secret: Buffer;
  private readonly token_reg_exp: RegExp = /^Bearer .+$/;

  public constructor() {
    this.secret = config.JWT_SECRET ? Buffer.from(config.JWT_SECRET) : randomBytes(16);
  }

  public static parselementIds(ids: string): number[] {
    const res: number[] = [];
    for (const elementId of ids.split(',')) {
      res.push(parseInt(elementId));
    }
    return res;
  }

  public encode(content: string): string {
    return createHash(config.ENCRYPTION).update(content).digest('base64');
  }

  public getTokenBody(header: Header): string {
    let token: string;
    if (header.authorization) {
      token = header.authorization;
    } else {
      token = header['x-refresh-token'];
    }

    if (this.token_reg_exp.test(token)) {
      return token.split(' ', 2)[1];
    } else {
      return null;
    }
  }
}
