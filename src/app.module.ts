// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { CollectionsModule } from './collections/collections.module';
import { AuthModule } from './auth/auth.module';
import { TaxonomiesModule } from './taxonomies/taxonomies.module';

@Module({
  imports: [
    // Load env file globally
    ConfigModule.forRoot({
      isGlobal: true, // no need to re-import in other modules
    }),

    // Async mongoose config with env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        autoIndex: true,
      }),
    }),

    AuthModule,
    BrandsModule,
    ProductsModule,
    CollectionsModule,
    TaxonomiesModule,
  ],
})
export class AppModule {}
