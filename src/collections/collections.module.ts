import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Collection, CollectionSchema } from './schemas/collection.schema';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { Brand, BrandSchema } from '../brands/schemas/brand.schema';
import { Product, ProductSchema } from 'src/products/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collection.name, schema: CollectionSchema },
      { name: Brand.name, schema: BrandSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [CollectionsService],
  controllers: [CollectionsController],
})
export class CollectionsModule {}
