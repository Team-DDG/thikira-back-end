import { DBModule } from '@app/db';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';

@Module({
  imports: [UtilModule, DBModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {
}
