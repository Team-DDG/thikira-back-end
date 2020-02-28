import { IsEnum, IsNumberString, IsOptional, IsString, validateSync } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { NodeEnv } from './node-env.enum';
import { fileExistsSync } from 'tsconfig-paths/lib/filesystem';
import { parse } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export type Config = Record<string, string>;

@Injectable()
export class ConfigService {
  @IsEnum(NodeEnv)
  public readonly NODE_ENV: NodeEnv;
  @IsString()
  public readonly MONGODB_HOST: string;
  @IsString()
  public readonly MONGODB_PASS: string;
  @IsNumberString() @IsOptional()
  public readonly MONGODB_PORT: string = '27017';
  @IsString()
  public readonly MONGODB_SCHEMA: string;
  @IsString()
  public readonly MONGODB_USER: string;
  @IsString()
  public readonly MYSQL_HOST: string;
  @IsString()
  public readonly MYSQL_PASS: string;
  @IsNumberString() @IsOptional()
  public readonly MYSQL_PORT: string = '3306';
  @IsString()
  public readonly MYSQL_SCHEMA: string;
  @IsString()
  public readonly MYSQL_USER: string;
  @IsOptional() @IsNumberString()
  public readonly PORT?: string;
  @IsOptional() @IsString()
  public readonly HOST?: string;
  @IsOptional() @IsString()
  public readonly JWT_SECRET?: string;
  @IsString()
  public readonly ENCIPHERMENT: string;
  public readonly mysql_config;
  public readonly mongodb_config;

  constructor(file_path?: string, custom_config?: Config) {
    Object.assign(this, {
      NODE_ENV: NodeEnv.development,
      ...process.env,
      ...file_path && fileExistsSync(file_path) && parse(readFileSync(file_path)),
      ...custom_config,
    });

    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error(errors[0].toString());
    }

    this.mysql_config = {
      database: this.MYSQL_SCHEMA,
      host: this.MYSQL_HOST,
      password: this.MYSQL_PASS,
      port: parseInt(this.MYSQL_PORT, 10),
      synchronize: true,
      type: 'mysql',
      username: this.MYSQL_USER,
    };
    this.mongodb_config = {
      database: this.MONGODB_SCHEMA,
      host: this.MONGODB_HOST,
      password: this.MONGODB_PASS,
      port: parseInt(this.MONGODB_PORT, 10),
      synchronize: true,
      type: 'mongodb',
      useUnifiedTopology: true,
      username: this.MONGODB_USER,
    };
  }
}

export const config: ConfigService = new ConfigService(resolve(process.cwd(), '.env'));
