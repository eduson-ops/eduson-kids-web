import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  Min,
  Max,
  Length,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClassroomService } from './classroom.service';
import { StudentRosterService, NewStudentInput } from './student-roster.service';
import { PdfRosterService } from './pdf-roster.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

class CreateClassroomDto {
  @IsString()
  @Length(2, 128)
  name!: string;
}

class TransferStudentDto {
  @IsString()
  studentId!: string;

  @IsString()
  toClassroomId!: string;
}

class AddStudentsDto {
  @IsInt()
  @Min(1)
  @Max(40)
  count!: number;

  @IsString()
  @Length(2, 32)
  namePrefix!: string;
}

class NewStudentDto implements NewStudentInput {
  @IsString()
  @Length(1, 64)
  firstName!: string;

  @IsString()
  @IsOptional()
  @Length(1, 64)
  lastName?: string;

  @IsInt()
  @IsOptional()
  @Min(2010)
  @Max(2025)
  birthYear?: number;
}

class BulkCreateStudentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewStudentDto)
  students!: NewStudentDto[];
}

@ApiTags('classrooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classrooms')
export class ClassroomController {
  constructor(
    private readonly classroomService: ClassroomService,
    private readonly rosterService: StudentRosterService,
    private readonly pdfService: PdfRosterService,
  ) {}

  @Post()
  @Roles('teacher')
  create(@Body() dto: CreateClassroomDto, @CurrentUser() user: JwtPayload) {
    return this.classroomService.create(user.sub, dto.name);
  }

  @Get()
  @Roles('teacher', 'curator', 'school_admin', 'platform_admin')
  @ApiOperation({ summary: 'List all classrooms for the current teacher' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.classroomService.findAllByTeacher(user.sub);
  }

  @Get(':id')
  @Roles('teacher', 'curator', 'school_admin', 'platform_admin')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.classroomService.findById(id);
  }

  @Get(':id/students')
  @Roles('teacher', 'curator', 'school_admin', 'platform_admin')
  @ApiOperation({ summary: 'List all students in a classroom' })
  getStudents(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.classroomService.getStudents(id, user.sub);
  }

  @Post(':id/transfer')
  @Roles('teacher', 'curator', 'school_admin', 'platform_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Transfer a student from this classroom to another' })
  async transferStudent(
    @Param('id', ParseUUIDPipe) fromClassroomId: string,
    @Body() dto: TransferStudentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.classroomService.transferStudent(
      dto.studentId,
      fromClassroomId,
      dto.toClassroomId,
      user.sub,
    );
  }

  @Patch(':id')
  @Roles('teacher')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateClassroomDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classroomService.update(id, user.sub, dto.name);
  }

  @Delete(':id')
  @Roles('teacher')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.classroomService.delete(id, user.sub);
  }

  @Post(':id/students')
  @Roles('teacher')
  addStudents(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddStudentsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classroomService.addStudents(id, user.sub, dto.count, dto.namePrefix);
  }

  /**
   * Bulk-create students by name list. Returns plaintext PINs for ONE-TIME
   * delivery. Combine with `GET :id/students/print-pdf` for the printable
   * raздатка PDF.
   *
   * Restricted to TEACHER. Tenant scope enforced via TenantContext.
   * Quota: tenant-level `maxStudents`.
   */
  @Post(':id/students/bulk')
  @Roles('teacher')
  @ApiOperation({
    summary: 'Bulk-create students by name list, return plaintext PIN once',
  })
  bulkCreateStudents(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BulkCreateStudentsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.rosterService.bulkCreateStudents(id, user.sub, dto.students);
  }

  /**
   * Generate A4 PDF with one card per student (login + PIN + QR-code) in
   * a 2×3 grid. The teacher prints, cuts and hands out at the next class.
   *
   * Important: PINs returned here are NEW (rotated) — not the same as the
   * ones from the bulk-create call. We don't keep plaintext PINs in DB,
   * so we have to issue fresh ones for the print sheet.
   *
   * For a roster that matches the bulk-create response, store the PINs
   * client-side immediately after `POST /students/bulk` and use the
   * download endpoint there instead of this regenerator.
   */
  @Post(':id/students/print-pdf')
  @Roles('teacher')
  @ApiOperation({ summary: 'Generate A4 PDF with student logins+PINs+QR' })
  async printPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    // Verify ownership (returns 403 otherwise)
    const classroom = await this.classroomService.findById(id);
    if (classroom.teacherId !== user.sub) throw new ForbiddenException();

    // Regenerate PINs for every student of the class (originals are not
    // recoverable — Argon2id one-way hash). Teacher then prints fresh sheet.
    let buf: Buffer;
    try {
      const cards = await this.rosterService.regeneratePinsAndGetCards(id, user.sub);
      buf = await this.pdfService.generateRosterPdf(cards, {
        className: classroom.name,
        brandName: 'KubiK',
      });
    } catch {
      throw new InternalServerErrorException('Не удалось сгенерировать PDF. Попробуйте ещё раз.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="kubik-class-${classroom.name}-codes.pdf"`,
    );
    res.send(buf);
  }
}
