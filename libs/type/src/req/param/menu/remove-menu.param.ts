import { IsNumberString } from 'class-validator';

export class ParamRemoveMenu {
  @IsNumberString()
  public readonly menuId: string;
}
