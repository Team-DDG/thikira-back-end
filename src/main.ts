import { config } from '@app/config';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { OpenAPIObject } from '@nestjs/swagger/dist/interfaces';
import { AppModule } from './app.module';

(async (): Promise<void> => {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });

  const options: Omit<OpenAPIObject, 'components' | 'paths'> = new DocumentBuilder()
    .setTitle('Thikira BackEnd')
    .setDescription('Thikira BackEnd')
    .setVersion(process.env.npm_package_version)
    .addBearerAuth()
    .build();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(config.PORT, config.HOST);
})();
