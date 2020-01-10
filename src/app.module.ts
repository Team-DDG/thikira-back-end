import { UserModule } from '@app/user';
import { Module } from '@nestjs/common';

@Module({
  imports: [UserModule],
})
export class AppModule {
}
