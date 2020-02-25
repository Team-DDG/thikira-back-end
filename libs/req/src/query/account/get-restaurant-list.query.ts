import { IsEnum, IsString } from 'class-validator';
import { SortOption } from '../../enum';

export class QueryGetRestaurantList {
  @IsEnum(SortOption)
  public readonly sort_option: SortOption;

  @IsString()
  public readonly category: string;
}
