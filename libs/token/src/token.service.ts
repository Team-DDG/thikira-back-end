import { ParsedTokenClass } from '@app/type/etc';
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenTypeEnum } from './token-type.enum';

@Injectable()
export class TokenService {
  @Inject()
  private readonly jwtService: JwtService;

  public createToken(id: number, type: TokenTypeEnum): string {
    return this.jwtService.sign({ id }, {
      expiresIn: type === TokenTypeEnum.access ? '30 min' : '14 days',
    });
  }

  public getIat(token: string): number {
    const { iat }: ParsedTokenClass = this.jwtService.verify(token);
    return iat;
  }

  public getIdByToken(token: string): number {
    try {
      const { id }: ParsedTokenClass = this.jwtService.verify(token);
      return id;
    } catch (element) {
      return null;
    }
  }
}
