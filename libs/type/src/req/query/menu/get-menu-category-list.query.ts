import { IsNumberString } from 'class-validator';

export class QueryGetMenuCategoryList {
  @IsNumberString()
  public readonly restaurantId: string;
}
