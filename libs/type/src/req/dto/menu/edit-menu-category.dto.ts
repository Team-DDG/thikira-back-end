import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoEditMenuCategory {
  @ApiProperty() @IsNumber()
  public readonly mc_id: number;
  @ApiProperty() @IsString()
  public readonly name: string;
}
