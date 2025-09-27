// src/collections/collections.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collection, CollectionDocument } from './schemas/collection.schema';
import { Brand, BrandDocument } from '../brands/schemas/brand.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateCollectionDto } from './dto/create-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name) private colModel: Model<CollectionDocument>,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
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

  async create(payload: CreateCollectionDto) {
    const now = new Date();

    // check duplicate slug within brand
    const exists = await this.colModel.findOne({
      brand_slug: payload.brand_slug,
      collection_slug: payload.collection_slug,
    });
    if (exists) {
      throw new Error('Collection with this slug already exists');
    }

    const newCollection = new this.colModel({
      ...payload,
      updated_at: now,
    });

    const saved = await newCollection.save();

    // auto-assign products if rules exist
    // if (saved.rules) {
    //   await this.assignProductsByRules(saved.brand_slug, saved.collection_slug);
    // }

    return saved.toObject();
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

  private productMatchesRules(product: any, rules: any): boolean {
    if (!rules) return false;

    const arrayFields = [
      'gender',
      'category',
      'product_type',
      'occasions',
      'styles',
    ];

    for (const field of arrayFields) {
      if (rules[field]?.length) {
        if (
          !product[field] ||
          !product[field].some((v) => rules[field].includes(v))
        ) {
          return false;
        }
      }
    }

    if (rules.attributes) {
      for (const attr of Object.keys(rules.attributes)) {
        if (rules.attributes[attr]?.length) {
          const productVal = product.attributes?.[attr];
          if (!productVal || !rules.attributes[attr].includes(productVal)) {
            return false;
          }
        }
      }
    }

    return true;
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

  // **************** Targeted Refresh on Product Lifecycle *******************

  async handleProductCreatedOrUpdated(product: any) {
    const collections = await this.colModel
      .find({ brand_slug: product.brand_slug })
      .lean();

    for (const col of collections) {
      if (!col.rules) continue;

      const matches = this.productMatchesRules(product, col.rules);
      const productIds: string[] = col.product_grid || [];

      if (matches) {
        if (!productIds.includes(product.product_id)) {
          // add to front
          const updated = [product.product_id, ...productIds];
          await this.colModel.updateOne(
            { _id: col._id },
            { $set: { product_grid: updated, updated_at: new Date() } },
          );
        }
      } else {
        if (productIds.includes(product.product_id)) {
          // remove it
          const updated = productIds.filter((id) => id !== product.product_id);
          await this.colModel.updateOne(
            { _id: col._id },
            { $set: { product_grid: updated, updated_at: new Date() } },
          );
        }
      }
    }
  }

  async handleProductDeleted(productId: string, brand_slug: string) {
    await this.colModel.updateMany(
      { brand_slug, product_grid: productId },
      {
        $pull: { product_grid: productId },
        $set: { updated_at: new Date() },
      },
    );
  }
}
