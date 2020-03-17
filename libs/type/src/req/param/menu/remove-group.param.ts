import { IsNumberString } from 'class-validator';

export class ParamRemoveGroup {
  @IsNumberString()
  public readonly g_id: string;
}
