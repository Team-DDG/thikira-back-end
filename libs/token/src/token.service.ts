import { ConfigService } from '@app/config';
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { sign, verify } from 'jsonwebtoken';
import { TokenTypeEnum } from './token-type.enum';

@Injectable()
export class TokenService {
  private readonly secret: Buffer;

  constructor(private readonly config: ConfigService) {
    this.secret = config.JWT_SECRET ? Buffer.from(config.JWT_SECRET) : randomBytes(16);
  }

  public async createToken(username: string, type: TokenTypeEnum): Promise<string> {
    const expiresIn = type.match(TokenTypeEnum.access) ? '30 min' : '14 days';
    return sign({ id: username }, this.secret, { expiresIn });
  }

  public async getUsernameByToken(token: string): Promise<string> {
    try {
      const parsedToken = await verify(token, this.secret, {}) as undefined as { id: string };
      return parsedToken.id;
    } catch (e) {
      return null;
    }
  }
}
