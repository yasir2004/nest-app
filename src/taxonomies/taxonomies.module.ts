import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Taxonomy, TaxonomySchema } from './schemas/taxonomy.schema';
import { TaxonomiesService } from './taxonomies.service';
import { TaxonomiesController } from './taxonomies.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Taxonomy.name, schema: TaxonomySchema },
    ]),
  ],
  controllers: [TaxonomiesController],
  providers: [TaxonomiesService],
  exports: [TaxonomiesService],
})
export class TaxonomiesModule {}
