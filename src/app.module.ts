import { MongoModule } from '@app/mongo';
import { Module } from '@nestjs/common';

@Module({
  imports: [MongoModule],
})
export class AppModule {
}
