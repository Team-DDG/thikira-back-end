import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DtoEditAddress {
  @ApiProperty() @IsString()
  public readonly road_address: string;
  @ApiProperty() @IsString()
  public readonly address: string;

}
