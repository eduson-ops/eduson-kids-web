import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChildLoginDto {
  @ApiProperty({ description: 'Child login (transliterated name)', example: 'ivan-ivanov-5b' })
  @IsString()
  @Length(3, 64)
  @Matches(/^[a-z0-9-]+$/, { message: 'login must be lowercase latin, digits, hyphens' })
  login!: string;

  @ApiProperty({ description: '6-digit PIN', example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'pin must be exactly 6 digits' })
  pin!: string;
}
