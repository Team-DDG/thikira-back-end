import { DBModule } from '@app/db';
import { ReqModule } from '@app/req';
import { ResModule } from '@app/res';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';

@Module({
  imports: [UtilModule, DBModule, ReqModule, ResModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {
}
