import { config } from '@app/config';
import { mongodbEntities, mysqlEntities } from '@app/entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  exports: [AuthService],
  imports: [
    JwtModule.register({ secret: config.JWT_SECRET }),
    TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
    TypeOrmModule.forFeature(mongodbEntities, 'mongodb')],
  providers: [
    AuthService, JwtStrategy,
  ],
})
export class AuthModule {
}
