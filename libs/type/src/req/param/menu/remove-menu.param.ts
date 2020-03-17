import { IsNumberString } from 'class-validator';

export class ParamRemoveMenu {
  @IsNumberString()
  public readonly m_id: string;
}
