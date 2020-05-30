import { IsNumberString } from 'class-validator';

export class ParamRemoveOption {
  @IsNumberString()
  public readonly optionId: string;
}
