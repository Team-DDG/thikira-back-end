import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { config } from '@app/config';

(async () => {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*'
  });

  const options = new DocumentBuilder()
    .setTitle('Thikira BackEnd')
    .setDescription('Thikira BackEnd')
    .setVersion(process.env.npm_package_version)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(config.PORT, config.HOST);
})();
