import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class DtoEditMenu {
  @ApiProperty() @IsNumber()
  public readonly m_id: number;
  @ApiProperty() @IsString() @IsOptional()
  public readonly description?: string;
  @ApiProperty() @IsUrl() @IsOptional()
  public readonly image?: string;
  @ApiProperty() @IsString() @IsOptional()
  public readonly name?: string;
  @ApiProperty() @IsNumber() @IsOptional()
  public readonly price?: number;
}
