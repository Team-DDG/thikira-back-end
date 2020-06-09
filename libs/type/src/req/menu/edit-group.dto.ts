import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DtoEditGroup {
  @ApiProperty() @IsNumber()
  public readonly g_id: number;
  @ApiProperty() @IsNumber() @IsOptional()
  public readonly max_count?: number;
  @ApiProperty() @IsString() @IsOptional()
  public readonly name?: string;
}
