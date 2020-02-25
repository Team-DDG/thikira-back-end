import { DBModule } from '@app/db';
import { Module } from '@nestjs/common';
import { ReqModule } from '@app/req';
import { ResModule } from '@app/res';
import { UserService } from './user.service';
import { UtilModule } from '@app/util';

@Module({
  exports: [UserService],
  imports: [UtilModule, DBModule, ReqModule, ResModule],
  providers: [UserService],
})
export class UserModule {
}
