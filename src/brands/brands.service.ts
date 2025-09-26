import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from './schemas/brand.schema';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
  ) {}

  async findByUserClerkId(clerkUserId: string) {
    return this.brandModel
      .find({ 'users.clerkUserId': clerkUserId })
      .select(
        'brand_slug brand_name categories logo_url locations about website_url is_active',
      )
      .lean()
      .exec();
  }
}
