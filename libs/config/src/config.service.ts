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
  public readonly MONGODB_URI: string;

  @IsOptional()
  @IsNumberString()
  public readonly PORT?: string;

  @IsOptional()
  @IsString()
  public readonly HOST?: string;

  @IsOptional()
  @IsString()
  public readonly JWT_SECRET?: string;

  constructor(filePath?: string, customConfig?: Config) {
    Object.assign(this, {
      NODE_ENV: NodeEnv.development,
      ...process.env,
      ...filePath && fileExistsSync(filePath) && parse(readFileSync(filePath)),
      ...customConfig,
    });

    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error(errors[0].toString());
    }
  }
}

export const config: ConfigService = new ConfigService(resolve(process.cwd(), '.env'));
