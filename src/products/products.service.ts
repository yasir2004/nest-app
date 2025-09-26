import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Brand, BrandDocument } from '../brands/schemas/brand.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
  ) {}

  private async authorizeBrand(brand_slug: string, clerkUserId: string) {
    return this.brandModel.findOne({
      brand_slug,
      'users.clerkUserId': clerkUserId,
    });
  }

  async findByIdAndUser(brand_slug: string, id: string, clerkUserId: string) {
    const brand = await this.authorizeBrand(brand_slug, clerkUserId);
    if (!brand) return { error: 'Unauthorized' };

    const product = await this.productModel
      .findOne({ product_id: id })
      .lean()
      .exec();
    return product;
  }

  async findByIdsAndUser(
    brand_slug: string,
    ids: string[],
    clerkUserId: string,
  ) {
    const brand = await this.authorizeBrand(brand_slug, clerkUserId);
    if (!brand) return { error: 'Unauthorized' };

    if (!ids || ids.length === 0) return [];

    const docs = await this.productModel.aggregate([
      { $match: { product_id: { $in: ids } } },
      {
        $project: {
          product_id: 1,
          product_name: 1,
          primary_variant_id: 1,
          variant: {
            $first: {
              $filter: {
                input: '$variants',
                as: 'variant',
                cond: { $eq: ['$$variant.variant_id', '$primary_variant_id'] },
              },
            },
          },
        },
      },
      {
        $project: {
          product_id: 1,
          product_name: 1,
          primary_variant_id: 1,
          color: '$variant.color',
          image: { $arrayElemAt: ['$variant.images', 0] },
          price: '$variant.price',
          in_stock: '$variant.in_stock',
        },
      },
    ]);

    // preserve input order
    const map = new Map(docs.map((d) => [d.product_id, d]));
    return ids.map((id) => map.get(id)).filter(Boolean);
  }

  async findByBrandAndCategoryAndUser(
    brand_slug: string,
    category: string,
    clerkUserId: string,
  ) {
    const brand = await this.authorizeBrand(brand_slug, clerkUserId);
    if (!brand) return { error: 'Unauthorized' };

    return this.productModel.find({ brand_slug, category }).lean().exec();
  }

  async findByBrandAndUser(brand_slug: string, clerkUserId: string) {
    const brand = await this.authorizeBrand(brand_slug, clerkUserId);
    if (!brand) return { error: 'Unauthorized' };

    return this.productModel.find({ brand_slug }).lean().exec();
  }

  async createForBrand(
    brand_slug: string,
    dto: CreateProductDto,
    clerkUserId: string,
  ) {
    const brand = await this.authorizeBrand(brand_slug, clerkUserId);
    if (!brand) return { error: 'Unauthorized' };

    const product = new this.productModel({ ...dto, brand_slug });
    return product.save();
  }

  async updateForBrand(
    brand_slug: string,
    id: string,
    dto: UpdateProductDto,
    clerkUserId: string,
  ) {
    const brand = await this.authorizeBrand(brand_slug, clerkUserId);
    if (!brand) return { error: 'Unauthorized' };

    return this.productModel
      .findOneAndUpdate(
        { product_id: id, brand_slug },
        { $set: dto },
        { new: true },
      )
      .lean()
      .exec();
  }

  async removeForBrand(brand_slug: string, id: string, clerkUserId: string) {
    const brand = await this.authorizeBrand(brand_slug, clerkUserId);
    if (!brand) return { error: 'Unauthorized' };

    return this.productModel
      .findOneAndDelete({ product_id: id, brand_slug })
      .lean()
      .exec();
  }
}
