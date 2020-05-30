import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class DtoEditEvent {
  @ApiProperty() @IsString()
  public readonly eventId: string;
  @ApiProperty() @IsString() @IsOptional()
  public readonly bannerImage?: string;
  @ApiProperty() @IsString()
  public readonly mainImage?: string;
}
