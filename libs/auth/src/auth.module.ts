import { config } from '@app/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LocalStrategy, JwtStrategy } from './strategies';

@Module({
  exports: [AuthService],
  imports: [JwtModule.register({ secret: config.JWT_SECRET })],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {
}
