import { DBModule } from '@app/db';
import { DtoModule } from '@app/dto';
import { ResModule } from '@app/res';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';

@Module({
  imports: [UtilModule, DBModule, DtoModule, ResModule],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {
}
