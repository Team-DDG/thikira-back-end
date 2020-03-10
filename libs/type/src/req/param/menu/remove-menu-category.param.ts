import { IsString } from 'class-validator';

export class ParamRemoveMenuCategory {
  @IsString()
  public readonly mc_id: string;
}
