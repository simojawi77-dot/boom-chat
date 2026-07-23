import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { ProfileService } from '../profile/profile.service';

interface AuthenticatedRequest extends Request {
  user: { userId: string; username: string };
}

const imageFilePipe = new ParseFilePipeBuilder()
  .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
  .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 }) // 5MB
  .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly profileService: ProfileService,
  ) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Req() req: AuthenticatedRequest,
    @UploadedFile(imageFilePipe) file: Express.Multer.File,
  ) {
    const result = await this.uploadService.uploadImage(file, 'avatars');
    return this.profileService.updateAvatar(req.user.userId, result.secure_url);
  }

  @Post('cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(
    @Req() req: AuthenticatedRequest,
    @UploadedFile(imageFilePipe) file: Express.Multer.File,
  ) {
    const result = await this.uploadService.uploadImage(file, 'covers');
    return this.profileService.updateCoverPhoto(
      req.user.userId,
      result.secure_url,
    );
  }
}
