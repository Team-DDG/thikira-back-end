import { IsNumberString } from 'class-validator';

export class QueryGetMenuList {
  @IsNumberString()
  public readonly menuCategoryId: string;
}
