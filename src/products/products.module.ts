import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Brand, BrandSchema } from 'src/brands/schemas/brand.schema';
import {
  Collection,
  CollectionSchema,
} from 'src/collections/schemas/collection.schema';
import { CollectionsModule } from 'src/collections/collections.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Brand.name, schema: BrandSchema },
      { name: Collection.name, schema: CollectionSchema },
    ]),
    CollectionsModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
