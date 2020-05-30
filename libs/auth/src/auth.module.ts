import { config } from '@app/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Module({
  exports: [AuthService],
  imports: [JwtModule.register({ secret: config.JWT_SECRET })],
  providers: [
    AuthService, //LocalStrategy, JwtStrategy
  ],
})
export class AuthModule {
}
