import { UploadOptionClass } from '@app/type/etc';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class DtoUploadGroup {
  @ApiProperty() @IsNumber()
  public readonly menuId: number;
  @ApiProperty() @IsNumber()
  public readonly maxCount: number;
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty() @IsArray() @IsOptional()
  public readonly option?: UploadOptionClass[];
}
