import { DBModule } from '@app/db';
import { MenuService } from './menu.service';
import { Module } from '@nestjs/common';
import { TypeModule } from '@app/type';
import { UtilModule } from '@app/util';

@Module({
  exports: [MenuService],
  imports: [DBModule, TypeModule, UtilModule],
  providers: [MenuService],
})
export class MenuModule {
}
