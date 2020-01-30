import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  exports: [UserService],
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserService],
})
export class UserModule {
}
