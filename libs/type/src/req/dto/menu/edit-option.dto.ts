import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoEditOption {
  @ApiProperty() @IsNumber()
  public readonly o_id: number;
  @ApiProperty() @IsString() @IsOptional()
  public readonly name?: string;
  @ApiProperty() @IsNumber() @IsOptional()
  public readonly price?: number;
}
