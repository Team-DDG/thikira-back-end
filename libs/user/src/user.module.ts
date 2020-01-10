import { MongoModule } from '@app/mongo';
import { TokenModule } from '@app/token';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [MongoModule, TokenModule],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService],
})
export class UserModule {
}
