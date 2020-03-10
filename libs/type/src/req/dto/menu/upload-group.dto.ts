import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DtoUploadOption } from './upload-option.dto';
import { stringify } from 'querystring';

export class DtoUploadGroup {
  @ApiProperty() @IsNumber()
  public readonly m_id: number;
  @ApiProperty() @IsNumber()
  public readonly max_count: number;
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty() @IsArray() @IsOptional()
  public readonly option?: DtoUploadOption[];

  constructor(payload) {
    Object.assign(this, payload);
  }

  public get(): string {
    return stringify({
      max_count: this.max_count,
      name: this.name,
    });
  }
}
