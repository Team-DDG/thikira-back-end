import { IsEnum, IsString } from 'class-validator';
import { SortOption } from '../../enum';

export class QueryGetRestaurantList {
  @IsString()
  public readonly category: string;
  @IsEnum(SortOption)
  public readonly sort_option: SortOption;
}
