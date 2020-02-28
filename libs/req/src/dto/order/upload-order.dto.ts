import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnumPaymentType } from '@app/db';

export class OrderOptionClass {
  @ApiProperty() @IsString()
  readonly name: string;
  @ApiProperty() @IsNumber()
  readonly price: number;
}

export class OrderGroupClass {
  @ApiProperty() @IsString()
  readonly name: string;
  @ApiProperty({ type: [OrderOptionClass] })
  @IsArray() @IsOptional()
  readonly option?: OrderOptionClass[];
}

export class OrderMenuClass {
  @ApiProperty() @IsNumber()
  readonly quantity: number;
  @ApiProperty() @IsString()
  readonly name: string;
  @ApiProperty() @IsNumber()
  readonly price: number;
  @ApiProperty({ type: [OrderGroupClass] })
  @IsArray() @IsOptional()
  readonly group?: OrderGroupClass[];
}

export class DtoUploadOrder {
  @ApiProperty() @IsNumber()
  public readonly discount_amount: number;
  @ApiProperty({ type: [OrderMenuClass] })
  @IsArray() @IsOptional()
  public readonly menu?: OrderMenuClass[];
  @ApiProperty() @IsNumber()
  public readonly quantity: number;
  @ApiProperty({ enum: EnumPaymentType, type: 'enum' })
  @IsString()
  public readonly payment_type: EnumPaymentType;
  @ApiProperty() @IsNumber()
  public readonly r_id: number;
}
