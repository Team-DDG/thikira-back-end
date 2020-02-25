import { DBModule } from '@app/db';
import { ReqModule } from '@app/req';
import { ResModule } from '@app/res';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';

@Module({
  imports: [UtilModule, DBModule, ReqModule, ResModule],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {
}
