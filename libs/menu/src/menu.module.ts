import { DBModule } from '@app/db';
import { MenuService } from './menu.service';
import { Module } from '@nestjs/common';
import { ReqModule } from '@app/req';
import { ResModule } from '@app/res';
import { UtilModule } from '@app/util';

@Module({
  exports: [MenuService],
  imports: [DBModule, ReqModule, ResModule, UtilModule],
  providers: [MenuService],
})
export class MenuModule {
}
