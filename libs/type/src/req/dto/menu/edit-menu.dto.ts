import { IsArray, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoEditMenu {
  @ApiProperty() @IsString() @IsOptional()
  public readonly description?: string;
  @ApiProperty() @IsArray() @IsOptional()
  public readonly group?: Array<{
    g_id: number,
    max_count: number,
    name: string,
    option: Array<{
      name: string,
      o_id: number,
      price: number,
    }>,
  }>;
  @ApiProperty() @IsUrl() @IsOptional()
  public readonly image?: string;
  @ApiProperty() @IsNumber()
  public readonly m_id: number;
  @ApiProperty() @IsString() @IsOptional()
  public readonly name?: string;
  @ApiProperty() @IsNumber() @IsOptional()
  public readonly price?: number;
}
