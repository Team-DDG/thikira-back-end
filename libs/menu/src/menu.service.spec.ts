import { ConfigModule, ConfigService } from '@app/config';
import { Restaurant } from '@app/restaurant';
import { UtilModule } from '@app/util';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group, Menu, MenuCategory, Option } from './entity';
import { MenuModule } from './menu.module';
import { MenuService } from './menu.service';

describe('MenuService', () => {
  let app: INestApplication;
  let service: MenuService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MenuModule, UtilModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory(config: ConfigService) {
            return {
              ...config.orm_config,
              entities: [Restaurant, Menu, MenuCategory, Option, Group],
            };
          },
        })],
      providers: [
        { provide: MenuService, useValue: [new Repository<Menu>()] },
        { provide: MenuService, useValue: [new Repository<MenuCategory>()] },
        { provide: MenuService, useValue: [new Repository<Option>()] },
        { provide: MenuService, useValue: [new Repository<Group>()] },
      ],
    }).compile();

    app = module.createNestApplication();
    service = module.get<MenuService>(MenuService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
