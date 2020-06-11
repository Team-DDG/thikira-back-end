import { Injectable } from '@nestjs/common';

@Injectable()
export class TestUtilService {
  public static makeElementComparable(param1: {}, param2: {}, deleteKey: string[]): {}[] {
    const data1: object = { ...param1 };
    const data2: object = { ...param2 };
    deleteKey.forEach((e: string) => {
      Reflect.deleteProperty(data1, e);
      Reflect.deleteProperty(data2, e);
    });
    return [data1, data2];
  }
}
