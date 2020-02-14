import { Injectable } from '@nestjs/common';
import { IsEnum, IsNumberString, IsOptional, IsString, validateSync } from 'class-validator';
import { parse } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileExistsSync } from 'tsconfig-paths/lib/filesystem';
import { NodeEnv } from './node-env.enum';

export type Config = Record<string, string>;

@Injectable()
export class ConfigService {
  @IsEnum(NodeEnv)
  public readonly NODE_ENV: NodeEnv;

  @IsString()
  public readonly DB: string;

  @IsString()
  public readonly DB_HOST: string;

  @IsNumberString()
  public readonly DB_PORT: string;

  @IsString()
  public readonly DB_USER: string;

  @IsString()
  public readonly DB_PASS: string;

  @IsString()
  public readonly DB_SCHEMA: string;

  @IsOptional()
  @IsNumberString()
  public readonly PORT?: string;

  @IsOptional()
  @IsString()
  public readonly HOST?: string;

  @IsOptional()
  @IsString()
  public readonly JWT_SECRET?: string;

  @IsString()
  public readonly ENCIPHERMENT: string;

  public readonly orm_config;

  constructor(file_path?: string, custom_config?: Config) {
    Object.assign(this, {
      ...{
        NODE_ENV: NodeEnv.development,
      },
      ...process.env,
      ...file_path && fileExistsSync(file_path) && parse(readFileSync(file_path)),
      ...custom_config,
    });

    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error(errors[0].toString());
    }

    this.orm_config = {
      database: this.DB_SCHEMA,
      host: this.DB_HOST,
      password: this.DB_PASS,
      port: parseInt(this.DB_PORT, 10),
      synchronize: true,
      type: this.DB,
      username: this.DB_USER,
    };
  }
}

export const config: ConfigService = new ConfigService(resolve(process.cwd(), '.env'));
