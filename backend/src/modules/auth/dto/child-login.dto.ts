import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChildLoginDto {
  @ApiProperty({ description: 'Child login (e.g. kub_school_0001 or ivan-ivanov-5b)', example: 'kub_school_0001' })
  @IsString()
  @Length(3, 64)
  @Matches(/^[a-z0-9_-]+$/, { message: 'login must be lowercase latin, digits, hyphens or underscores' })
  login!: string;

  @ApiProperty({ description: '6-char alphanumeric PIN (digits or lowercase letters)', example: 'ab3k7m' })
  @IsString()
  @Matches(/^[a-z0-9]{6}$/, { message: 'pin must be exactly 6 alphanumeric characters' })
  pin!: string;
}
