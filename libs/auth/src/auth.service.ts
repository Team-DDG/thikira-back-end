import { ParsedTokenClass } from '@app/type/etc';
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenTypeEnum } from './enum';

@Injectable()
export class AuthService {
  @Inject()
  private readonly jwtService: JwtService;

  public createToken(id: number, type: TokenTypeEnum): string {
    return this.jwtService.sign({ id }, {
      expiresIn: type === TokenTypeEnum.access ? '30 min' : '14 days',
    });
  }

  public parseToken(token: string): ParsedTokenClass {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }
}
