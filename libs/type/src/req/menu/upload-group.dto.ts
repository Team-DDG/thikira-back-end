import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { UploadOptionClass } from '../..';

export class DtoUploadGroup {
  @ApiProperty() @IsNumber()
  public readonly m_id: number;
  @ApiProperty() @IsNumber()
  public readonly max_count: number;
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty({ type: [UploadOptionClass] }) @IsArray() @IsOptional()
  public readonly option?: UploadOptionClass[];
}
