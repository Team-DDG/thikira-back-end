import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EditAddressDto {
  @ApiProperty({
    description: '도로명 주소',
    example: '경기 이천시 아리역로 25 남구빌딩',
  })
  @IsString()
  public readonly add_street: string;

  @ApiProperty({
    description: '지번 주소',
    example: '경기도 이천시 증포동 404-9',
  })
  @IsString()
  public readonly add_parcel: string;
}
