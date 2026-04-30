import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { BlogTranslation } from './entities/blog-translation.entity';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TranslateModule } from '../translate/translate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogPost, BlogTranslation]),
    TranslateModule,
  ],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
