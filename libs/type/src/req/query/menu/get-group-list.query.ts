import { IsNumberString } from 'class-validator';

export class QueryGetGroupList {
  @IsNumberString()
  public readonly menuId: string;
}
