// src/collections/collections.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Collection, CollectionDocument } from './schemas/collection.schema';
import { Brand, BrandDocument } from '../brands/schemas/brand.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name) private colModel: Model<CollectionDocument>,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  async findByBrandAndUser(brand_slug: string, clerkUserId: string) {
    const brandExists = await this.brandModel
      .findOne({ brand_slug, 'users.clerkUserId': clerkUserId })
      .lean()
      .exec();

    if (!brandExists) return null;

    return this.colModel
      .find({ brand_slug })
      .select('collection_name collection_slug')
      .lean()
      .exec();
  }

  async findOne(brand_slug: string, collection_slug: string) {
    return this.colModel.findOne({ brand_slug, collection_slug }).lean().exec();
  }

  async upsert(brand_slug: string, collection_slug: string, payload: any) {
    const now = new Date();
    const res = await this.colModel
      .findOneAndUpdate(
        { brand_slug, collection_slug },
        { $set: { ...payload, brand_slug, collection_slug, updated_at: now } },
        { upsert: true, new: true },
      )
      .lean();

    // auto-assign products if rules are present
    // if (res.rules) {
    //   await this.assignProductsByRules(brand_slug, collection_slug);
    // }

    return res;
  }

  // **************** Rule-Based Product Assignment ***************************

  private buildQueryFromRules(brand_slug: string, rules: any) {
    const query: any = { brand_slug };

    // Handle arrays at the top-level (gender, category, product_type, occasions, styles)
    const arrayFields = [
      'gender',
      'category',
      'product_type',
      'occasions',
      'styles',
    ];

    arrayFields.forEach((field) => {
      if (
        rules[field] &&
        Array.isArray(rules[field]) &&
        rules[field].length > 0
      ) {
        query[field] = { $in: rules[field] };
      }
    });

    // Handle attributes object
    if (rules.attributes) {
      Object.keys(rules.attributes).forEach((attr) => {
        if (rules.attributes[attr] && rules.attributes[attr].length > 0) {
          query[`attributes.${attr}`] = { $in: rules.attributes[attr] };
        }
      });
    }

    return query;
  }

  async assignProductsByRules(brand_slug: string, collection_slug: string) {
    const collection = await this.colModel
      .findOne({ brand_slug, collection_slug })
      .lean();

    if (!collection || !collection.rules) return null;

    const query = this.buildQueryFromRules(brand_slug, collection.rules);

    const products = await this.productModel
      .find(query)
      .select('product_id')
      .lean();

    const matchedIds = products.map((p) => p.product_id);
    const currentIds: string[] = collection.product_grid || [];

    // Keep only IDs still valid
    const preserved = currentIds.filter((id) => matchedIds.includes(id));

    // New ones = matched but not already in preserved
    const newOnes = matchedIds.filter((id) => !preserved.includes(id));

    // Final: new ones first, then preserved (to keep old order)
    const updatedGrid = [...newOnes, ...preserved];

    await this.colModel.updateOne(
      { brand_slug, collection_slug },
      { $set: { product_grid: updatedGrid, updated_at: new Date() } },
    );

    return true;
  }

  async refreshAllCollectionsForBrand(brand_slug: string) {
    const collections = await this.colModel.find({ brand_slug }).lean();

    for (const col of collections) {
      if (col.rules) {
        await this.assignProductsByRules(brand_slug, col.collection_slug);
      }
    }

    return true;
  }
}
