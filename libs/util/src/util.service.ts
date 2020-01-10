import { ConfigService } from '@app/config';
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class UtilService {
  constructor(private readonly config: ConfigService) {
  }

  public async encode(content: string): Promise<string> {
    return createHash(this.config.ENCIPHERMENT).update(content).digest('base64');
  }
}
