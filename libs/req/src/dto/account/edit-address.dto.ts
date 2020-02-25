import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DtoEditAddress {
  @ApiProperty()  @IsString()
  public readonly add_street: string;
  @ApiProperty()  @IsString()
  public readonly add_parcel: string;

}
