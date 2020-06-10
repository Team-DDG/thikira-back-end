import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilService {
  public static parseIds(ids: string): number[] {
    const res: number[] = [];
    for (const e_id of ids.split(',')) {
      res.push(parseInt(e_id));
    }
    return res;
  }
}
