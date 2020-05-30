import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DtoEditGroup {
  @ApiProperty() @IsNumber()
  public readonly groupId: number;
  @ApiProperty() @IsNumber() @IsOptional()
  public readonly maxCount?: number;
  @ApiProperty() @IsString() @IsOptional()
  public readonly name?: string;
}
