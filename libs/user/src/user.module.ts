import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  exports: [UserService],
  imports: [
    UtilModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserService],
})
export class UserModule {
}
