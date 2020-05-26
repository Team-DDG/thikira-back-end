import { DotenvParseOutput, parse } from 'dotenv';
import { IsEnum, IsNumberString, IsOptional, IsString, validateSync } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { NodeEnv } from './node-env.enum';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ValidationError } from 'class-validator/validation/ValidationError';
import { fileExistsSync } from 'tsconfig-paths/lib/filesystem';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export type Config = Record<string, string>;

@Injectable()
export class ConfigService {
  @IsString()
  public readonly ENCRYPTION: string;
  @IsOptional() @IsString()
  public readonly HOST?: string;
  @IsOptional() @IsString()
  public readonly JWT_SECRET?: string;
  @IsString() @IsOptional()
  public readonly MONGODB_URL: string;
  @IsString()
  public readonly MYSQL_HOST: string;
  @IsString()
  public readonly MYSQL_PASS: string;
  @IsNumberString() @IsOptional()
  public readonly MYSQL_PORT: string = '3306';
  @IsString()
  public readonly MYSQL_SCHEMA: string;
  @IsString()
  public readonly MYSQL_TYPE: 'mysql' | 'mariadb' = 'mysql';
  @IsString()
  public readonly MYSQL_USER: string;
  @IsEnum(NodeEnv)
  public readonly NODE_ENV: NodeEnv;
  @IsOptional() @IsNumberString()
  public readonly PORT?: string = '3000';
  public readonly mysql_config: TypeOrmModuleOptions;
  public readonly mongodb_config: TypeOrmModuleOptions;

  public constructor(file_path?: string, custom_config?: Config) {
    let env: DotenvParseOutput;
    if (file_path && fileExistsSync(file_path)) {
      env = parse(readFileSync(file_path));
    }

    Object.assign(this, {
      NODE_ENV: NodeEnv.development,
      ...env, ...process.env, ...custom_config,
    });

    const errors: ValidationError[] = validateSync(this);
    if (0 < errors.length) {
      throw new Error(errors[0].toString());
    }

    this.mysql_config = {
      database: this.MYSQL_SCHEMA,
      host: this.MYSQL_HOST,
      name: 'mysql',
      password: this.MYSQL_PASS,
      port: parseInt(this.MYSQL_PORT, 10),
      synchronize: true,
      type: this.MYSQL_TYPE,
      username: this.MYSQL_USER,
    };
    this.mongodb_config = {
      name: 'mongodb',
      synchronize: true,
      type: 'mongodb',
      url: this.MONGODB_URL,
      useUnifiedTopology: true,
    };
  }
}

export const config: ConfigService = new ConfigService(resolve(process.cwd(), '.env'));
