import { IsArray, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UploadGroupClass } from '@app/type/etc';

export class DtoUploadMenu {
  @ApiProperty() @IsString()
  public readonly description: string;
  @ApiProperty() @IsUrl()
  public readonly image: string;
  @ApiProperty() @IsNumber()
  public readonly mc_id: number;
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty() @IsNumber()
  public readonly price: number;
  @ApiProperty()  @IsArray()  @IsOptional()
  public readonly g?: UploadGroupClass[];
}
