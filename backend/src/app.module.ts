import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'node:path';
import configuration from './config/configuration.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { ArticlesModule } from './modules/articles/articles.module.js';
import { GalleryModule } from './modules/gallery/gallery.module.js';
import { PortfoliosModule } from './modules/portfolios/portfolios.module.js';
import { InquiriesModule } from './modules/inquiries/inquiries.module.js';
import { CompanyProfileModule } from './modules/company-profile/company-profile.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { ApprovalsModule } from './modules/approvals/approvals.module.js';
import { UploadModule } from './modules/upload/upload.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    ServeStaticModule.forRoot({ rootPath: join(process.cwd(), 'uploads'), serveRoot: '/uploads' }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    ArticlesModule,
    GalleryModule,
    PortfoliosModule,
    InquiriesModule,
    CompanyProfileModule,
    NotificationsModule,
    ApprovalsModule,
    UploadModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }) },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
