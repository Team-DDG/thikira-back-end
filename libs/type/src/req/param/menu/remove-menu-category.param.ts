import { IsNumberString } from 'class-validator';

export class ParamRemoveMenuCategory {
  @IsNumberString()
  public readonly mc_id: string;
}
