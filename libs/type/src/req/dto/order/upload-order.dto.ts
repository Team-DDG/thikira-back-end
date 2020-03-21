import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnumPaymentType } from '@app/db';

export class DtoOrderOption {
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty() @IsNumber()
  public readonly price: number;
}

export class DtoOrderGroup {
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty({ type: [DtoOrderOption] })
  @IsArray() @IsOptional()
  public readonly option: DtoOrderOption[];
}

export class DtoOrderMenu {
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty() @IsNumber()
  public readonly price: number;
  @ApiProperty() @IsNumber()
  public readonly quantity: number;
  @ApiProperty({ type: [DtoOrderGroup] })
  @IsArray() @IsOptional()
  public readonly group?: DtoOrderGroup[];
}

export class DtoUploadOrder {
  @ApiProperty() @IsNumber()
  public readonly r_id: number;
  @ApiProperty() @IsNumber()
  public readonly discount_amount: number;
  @ApiProperty({ type: [DtoOrderMenu] })
  @IsArray() @IsOptional()
  public readonly menu?: DtoOrderMenu[];
  @ApiProperty({ enum: EnumPaymentType, type: 'enum' })
  @IsString()
  public readonly payment_type: EnumPaymentType;
}
