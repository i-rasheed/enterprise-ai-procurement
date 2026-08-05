import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { PlatformModule } from '../platform/platform.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  imports: [DatabaseModule, PlatformModule],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
