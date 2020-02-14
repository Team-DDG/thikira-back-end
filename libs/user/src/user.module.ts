import { DBModule } from '@app/db';
import { DtoModule } from '@app/dto';
import { ResModule } from '@app/res';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';

@Module({
  imports: [UtilModule, DBModule, DtoModule, ResModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {
}
