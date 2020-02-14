import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class DtoEditUserInfo {
  @ApiProperty({
    description: '닉네임',
    example: '증포동 bbq',
  })
  @IsString()
  @IsOptional()
  public readonly nickname?: string;

  @ApiProperty({
    description: '전화번호',
    example: '01012312312',
  })
  @IsNumberString()
  @IsOptional()
  public readonly phone?: string;
}
