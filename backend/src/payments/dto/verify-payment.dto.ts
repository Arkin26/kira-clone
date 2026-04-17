import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  signature!: string;

  @IsUUID('all')
  intentId!: string;
}
