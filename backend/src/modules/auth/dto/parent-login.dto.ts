import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParentLoginDto {
  @ApiProperty({ example: 'parent@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, maxLength: 128 })
  @IsString()
  @Length(8, 128)
  password!: string;
}
