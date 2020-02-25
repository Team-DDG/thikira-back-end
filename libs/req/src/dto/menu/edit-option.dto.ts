import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoEditOption {
  @ApiProperty() @IsString() @IsOptional()
  public readonly name?: string;
  @ApiProperty() @IsNumber()
  public readonly o_id: number;
  @ApiProperty() @IsNumber() @IsOptional()
  public readonly price?: number;
}
