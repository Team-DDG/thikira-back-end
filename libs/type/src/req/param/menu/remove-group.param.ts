import { IsString } from 'class-validator';

export class ParamRemoveGroup {
  @IsString()
  public readonly g_id: string;
}
