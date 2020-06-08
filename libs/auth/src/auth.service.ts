import { ParsedTokenClass } from '@app/type';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnumTokenType } from './enum';

@Injectable()
export class AuthService {
  @Inject()
  private readonly jwtService: JwtService;

  public createToken(id: number, type: EnumTokenType): string {
    return this.jwtService.sign({ id }, {
      expiresIn: type === EnumTokenType.access ? '30 min' : '14 days',
    });
  }

  public parseToken(token: string): ParsedTokenClass {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
