import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  @IsNotEmpty()
  merchantId!: string;

  /** Must be strictly greater than zero (see also PaymentsService.assertPositiveFiniteAmount). */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount!: number;
}
