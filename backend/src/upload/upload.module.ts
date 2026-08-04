import { Module } from '@nestjs/common';
import { ProfileModule } from '../profile/profile.module';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  imports: [ProfileModule],
  controllers: [UploadController],
  providers: [UploadService, CloudinaryProvider],
})
export class UploadModule {}
