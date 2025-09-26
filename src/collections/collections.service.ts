// src/collections/collections.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collection, CollectionDocument } from './schemas/collection.schema';
import { Brand, BrandDocument } from '../brands/schemas/brand.schema';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name) private colModel: Model<CollectionDocument>,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
  ) {}

  async findByBrandAndUser(brand_slug: string, clerkUserId: string) {
    // Check if brand exists and user belongs to it
    const brandExists = await this.brandModel
      .findOne({ brand_slug, 'users.clerkUserId': clerkUserId })
      .lean()
      .exec();

    if (!brandExists) return null;

    return this.colModel
      .find({ brand_slug })
      .select('collection_name collection_slug -_id')
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
    return res;
  }

  // **************** Collection Handler Functions ***************************
}
