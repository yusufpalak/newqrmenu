import {  Controller, Post, UseGuards, UseInterceptors, UploadedFile, Request  } from '@nestjs/common';
import {  FileInterceptor  } from '@nestjs/platform-express';
import {  JwtAuthGuard  } from '../auth/guards/jwt-auth.guard';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file, @Request() req) {
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
