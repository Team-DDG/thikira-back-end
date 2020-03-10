import { DBModule } from '@app/db';
import { Module } from '@nestjs/common';
import { TypeModule } from '@app/type';
import { UserService } from './user.service';
import { UtilModule } from '@app/util';

@Module({
  exports: [UserService],
  imports: [DBModule, TypeModule, UtilModule],
  providers: [UserService],
})
export class UserModule {
}
