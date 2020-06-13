import { IsEnum, IsString } from 'class-validator';
import { EnumSortOption } from '../..';

export class QueryGetRestaurantList {
  @IsString()
  public readonly category: string;
  @IsEnum(EnumSortOption)
  public readonly sort_option: EnumSortOption;
}
