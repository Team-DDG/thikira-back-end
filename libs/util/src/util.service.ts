import { ConfigService } from '@app/config';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class UtilService {
  private readonly tokenRegExp = /^Bearer .+$/;

  constructor(private readonly config: ConfigService) {
  }

  public async encode(content: string): Promise<string> {
    return createHash(this.config.ENCIPHERMENT).update(content).digest('base64');
  }

  public async getTokenBody(token: string): Promise<string> {
    try {
      await this.tokenRegExp.test(token);
      return token.split(' ', 2)[1];
    } catch (e) {
      throw new ForbiddenException();
    }
  }
}
