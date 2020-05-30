import { Injectable } from '@nestjs/common';

@Injectable()
export class TestUtilService {
  public static makeElementComparable(param1: {}, param2: {}, deleteKey: string[]): {}[] {
    const data1: object = { ...param1 };
    const data2: object = { ...param2 };
    for (const element of deleteKey) {
      Reflect.deleteProperty(data1, element);
      Reflect.deleteProperty(data2, element);
    }
    return [data1, data2];
  }
}
