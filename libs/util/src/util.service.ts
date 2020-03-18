import { createHash, randomBytes } from 'crypto';
import { sign, verify } from 'jsonwebtoken';
import { Header } from '@app/type/etc';
import { Injectable } from '@nestjs/common';
import { TokenTypeEnum } from './token-type.enum';
import { config } from '@app/config';

@Injectable()
export class UtilService {
  private readonly secret: Buffer;
  private readonly token_reg_exp: RegExp = /^Bearer .+$/;

  public constructor() {
    this.secret = config.JWT_SECRET ? Buffer.from(config.JWT_SECRET) : randomBytes(16);
  }

  public static parse_ids(ids: string): number[] {
    const res: number[] = [];
    for (const e_id of ids.split(',')) {
      res.push(parseInt(e_id));
    }
    return res;
  }

  public encode(content: string): string {
    return createHash(config.ENCIPHERMENT).update(content).digest('base64');
  }

  public create_token(email: string, type: TokenTypeEnum): string {
    const expires_in: string = type === TokenTypeEnum.access ? '30 min' : '14 days';
    return sign({ id: email }, this.secret, { expiresIn: expires_in });
  }

  public get_token_body(header: Header): string {
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

  public get_email_by_token(token: string): string {
    try {
      const parsed_token: { id: string } = verify(token, this.secret, {}) as undefined as { id: string };
      return parsed_token.id;
    } catch (e) {
      return null;
    }
  }
}
