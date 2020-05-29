import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class DtoEditUserInfo {
  @ApiProperty() @IsString() @IsOptional()
  public readonly nickname?: string;
  @ApiProperty() @IsNumberString() @IsOptional()
  public readonly phone?: string;
}
