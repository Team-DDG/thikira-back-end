import { IsString } from 'class-validator';

export class ParamRemoveOption {
  @IsString()
  public readonly o_id: string;
}
