import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class DtoEditMenuCategory {
  @ApiProperty() @IsNumber()
  public readonly mc_id: number;
  @ApiProperty() @IsString()
  public readonly name: string;
}
