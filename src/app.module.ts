import { ConfigModule } from '@app/config';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule],
})
export class AppModule {
}
