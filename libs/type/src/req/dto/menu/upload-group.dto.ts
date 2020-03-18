import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UploadOptionClass } from '@app/type/etc';

export class DtoUploadGroup {
  @ApiProperty() @IsNumber()
  public readonly m_id: number;
  @ApiProperty() @IsNumber()
  public readonly max_count: number;
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty() @IsArray() @IsOptional()
  public readonly option?: UploadOptionClass[];
}
