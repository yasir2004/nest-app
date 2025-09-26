import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Taxonomy, TaxonomyDocument } from './schemas/taxonomy.schema';

@Injectable()
export class TaxonomiesService {
  constructor(
    @InjectModel(Taxonomy.name) private taxonomyModel: Model<TaxonomyDocument>,
  ) {}

  async getTaxonomy(): Promise<Taxonomy> {
    let taxonomy = await this.taxonomyModel.findOne().exec();

    // Auto-create empty doc if none exists
    if (!taxonomy) {
      taxonomy = new this.taxonomyModel({});
      await taxonomy.save();
    }

    return taxonomy;
  }
}
