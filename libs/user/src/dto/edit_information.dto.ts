import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString } from 'class-validator';

export class EditInformationDto {
  @ApiProperty({
    description: '업체 이름',
    example: '증포동 bbq',
  })
  @IsString()
  public readonly name: string;

  @ApiProperty({
    description: '전화번호',
    example: '01012312312',
  })
  @IsNumberString()
  public readonly phone: string;
}
