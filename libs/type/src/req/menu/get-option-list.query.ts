import { IsNumberString } from 'class-validator';

export class QueryGetOptionList {
  @IsNumberString()
  public readonly g_id: string;
}
