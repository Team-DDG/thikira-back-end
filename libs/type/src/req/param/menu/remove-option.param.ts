import { IsNumberString } from 'class-validator';

export class ParamRemoveOption {
  @IsNumberString()
  public readonly o_id: string;
}
