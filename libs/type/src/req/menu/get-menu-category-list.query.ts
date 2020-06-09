import { IsNumberString } from 'class-validator';

export class QueryGetMenuCategoryList {
  @IsNumberString()
  public readonly r_id: string;
}
