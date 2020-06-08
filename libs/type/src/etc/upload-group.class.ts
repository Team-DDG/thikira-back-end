import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { UploadOptionClass } from './upload-option.class';

export class UploadGroupClass {
  @ApiProperty() @IsNumber()
  public readonly maxCount: number;
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty({ type: [UploadOptionClass] }) @IsArray() @IsOptional()
  public readonly option?: UploadOptionClass[];
}
