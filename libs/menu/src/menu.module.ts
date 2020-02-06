import { DBModule } from '@app/db';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';

@Module({
  imports: [UtilModule, DBModule],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {
}
