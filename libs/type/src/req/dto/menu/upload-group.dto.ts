import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { UploadOptionClass } from '../../../etc';

export class DtoUploadGroup {
  @ApiProperty() @IsNumber()
  public readonly menuId: number;
  @ApiProperty() @IsNumber()
  public readonly maxCount: number;
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty({ type: [UploadOptionClass] }) @IsArray() @IsOptional()
  public readonly option?: UploadOptionClass[];
}
