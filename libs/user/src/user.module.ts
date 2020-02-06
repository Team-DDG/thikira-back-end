import { DBModule } from '@app/db';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [UtilModule, DBModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {
}
