import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnumPaymentType } from '@app/db';

export class DtoOrderOption {
  @ApiProperty() @IsString()
  readonly name: string;
  @ApiProperty() @IsNumber()
  readonly price: number;
}

export class DtoOrderGroup {
  @ApiProperty() @IsString()
  readonly name: string;
  @ApiProperty({ type: [DtoOrderOption] })
  @IsArray() @IsOptional()
  readonly o?: DtoOrderOption[];
}

export class DtoOrderMenu {
  @ApiProperty() @IsNumber()
  readonly quantity: number;
  @ApiProperty() @IsString()
  readonly name: string;
  @ApiProperty() @IsNumber()
  readonly price: number;
  @ApiProperty({ type: [DtoOrderGroup] })
  @IsArray() @IsOptional()
  readonly g?: DtoOrderGroup[];
}

export class DtoUploadOrder {
  @ApiProperty() @IsNumber()
  public readonly discount_amount: number;
  @ApiProperty({ type: [DtoOrderMenu] })
  @IsArray() @IsOptional()
  public readonly m?: DtoOrderMenu[];
  @ApiProperty() @IsNumber()
  public readonly quantity: number;
  @ApiProperty({ enum: EnumPaymentType, type: 'enum' })
  @IsString()
  public readonly payment_type: EnumPaymentType;
  @ApiProperty() @IsNumber()
  public readonly r_id: number;
}
