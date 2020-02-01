import { IsArray, IsNumber, IsString, IsUrl } from 'class-validator';

export class UploadDto {
  @IsString()
  public readonly name: string;
  @IsNumber()
  public readonly price: number;
  @IsString()
  public readonly description: string;
  @IsUrl()
  public readonly image: string;
  @IsNumber()
  public readonly menu_category: number;
  @IsArray()
  public readonly option: Array<{
    name: string,
    price: number,
  }>;
}
