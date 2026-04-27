import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TeacherLoginDto {
  @ApiProperty({ example: 'teacher@school.ru' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, maxLength: 128 })
  @IsString()
  @Length(8, 128)
  password!: string;

  @ApiProperty({ description: 'School code (issued by admin)', example: 'DEMO-2024' })
  @IsString()
  @Matches(/^[A-Z0-9-]{4,32}$/, { message: 'schoolCode must be uppercase alphanumeric with hyphens' })
  schoolCode!: string;
}
