import { IsNumberString } from 'class-validator';

export class QueryGetOptionList {
  @IsNumberString()
  public readonly groupId: string;
}
