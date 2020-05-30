import { IsNumberString } from 'class-validator';

export class ParamRemoveGroup {
  @IsNumberString()
  public readonly groupId: string;
}
