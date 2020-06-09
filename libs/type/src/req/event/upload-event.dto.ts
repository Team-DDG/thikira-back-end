import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DtoUploadEvent {
  @ApiProperty() @IsString()
  public banner_image: string;
  @ApiProperty() @IsString()
  public main_image: string;
}
