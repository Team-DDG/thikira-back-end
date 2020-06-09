import { IsNumberString } from 'class-validator';

export class QueryGetMenuList {
  @IsNumberString()
  public readonly mc_id: string;
}
