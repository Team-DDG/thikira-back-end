import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UploadOptionClass } from './upload-option.class';

export class UploadGroupClass {
  @ApiProperty() @IsNumber()
  public readonly max_count: number;
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty() @IsArray() @IsOptional()
  public readonly o?: UploadOptionClass[];
}
