import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from 'src1/app.controller';
import { AppService } from 'src1/app.service';
import { TagModule } from 'src1/tag/tag.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src1/user/user.module';
import ormconfig from 'src1/ormconfig';
import { AuthMiddleware } from 'src1/user/middlewares/auth.middleware';
import { ArticleModule } from './article/article.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    TagModule,
    UserModule,
    ArticleModule,
    // ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
