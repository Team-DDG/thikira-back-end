import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DtoCheckPassword {
  @ApiProperty({
    description: '비밀번호',
    example: 'adfasdf123',
  })
  @IsString()
  public readonly password: string;
}
