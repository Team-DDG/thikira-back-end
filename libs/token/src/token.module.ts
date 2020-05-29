import { config } from '@app/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';

@Module({
  exports: [TokenService],
  imports: [JwtModule.register({ secret: config.JWT_SECRET })],
  providers: [TokenService],
})
export class TokenModule {
}
