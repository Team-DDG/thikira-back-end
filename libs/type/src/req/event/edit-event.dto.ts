import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DtoEditEvent {
  @ApiProperty() @IsString()
  public readonly e_id: string;
  @ApiProperty() @IsString() @IsOptional()
  public readonly banner_image?: string;
  @ApiProperty() @IsString()
  public readonly main_image?: string;
}
