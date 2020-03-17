import { IsNumberString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoEditUserInfo {
  @ApiProperty() @IsString() @IsOptional()
  public readonly nickname?: string;
  @ApiProperty() @IsNumberString() @IsOptional()
  public readonly phone?: string;
}
