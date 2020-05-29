import { ParsedToken } from '@app/type/etc';
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenTypeEnum } from './token-type.enum';

@Injectable()
export class TokenService {
  @Inject()
  private readonly jwt_service: JwtService;

  public create_token(id: number, type: TokenTypeEnum): string {
    return this.jwt_service.sign({ id }, {
      expiresIn: type === TokenTypeEnum.access ? '30 min' : '14 days',
    });
  }

  public get_iat(token: string): number {
    const { iat }: ParsedToken = this.jwt_service.verify(token);
    return iat;
  }

  public get_id_by_token(token: string): number {
    try {
      const { id }: ParsedToken = this.jwt_service.verify(token);
      return id;
    } catch (e) {
      return null;
    }
  }
}
