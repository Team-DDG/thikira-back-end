import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DtoEditAddress {
  @ApiProperty() @IsString()
  public readonly roadAddress: string;
  @ApiProperty() @IsString()
  public readonly address: string;

}
