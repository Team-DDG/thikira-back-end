import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DtoEditAddress {
  @ApiProperty() @IsString()
  public readonly addStreet: string;
  @ApiProperty() @IsString()
  public readonly addParcel: string;

}
