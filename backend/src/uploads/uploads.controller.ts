import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IAuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { S3Service, IUploadResult } from '../storage/s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../media/entities/media.entity';
import { IsOptional, IsString } from 'class-validator';

class UploadOptionsDto {
  @IsOptional()
  @IsString()
  folder?: string;
}

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(
    private readonly s3: S3Service,
    @InjectRepository(Media) private readonly mediaRepo: Repository<Media>,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadOptionsDto,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<IUploadResult & { id: string }> {
    if (!file) throw new BadRequestException('File required');
    const result = await this.s3.upload(file, body.folder || 'general');
    const media = await this.mediaRepo.save(
      this.mediaRepo.create({
        tenantId: user.tenantId ?? null,
        userId: user.userId,
        key: result.key,
        url: result.url,
        originalName: result.originalName,
        mimeType: result.mimeType,
        size: result.size,
      }),
    );
    return { ...result, id: media.id };
  }
}
