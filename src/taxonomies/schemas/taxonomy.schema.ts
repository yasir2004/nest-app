import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaxonomyDocument = Taxonomy & Document;

@Schema({ collection: 'Taxonomies', versionKey: false })
export class Taxonomy {
  @Prop({ type: [String], default: [] })
  sleeves: string[];

  @Prop({ type: [String], default: [] })
  silhouette: string[];

  @Prop({ type: [String], default: [] })
  fabric: string[];

  @Prop({ type: [String], default: [] })
  neckline: string[];

  @Prop({ type: [String], default: [] })
  pattern: string[];

  @Prop({ type: [String], default: [] })
  detail: string[];

  @Prop(raw({}))
  color: Record<string, any>;

  @Prop({ type: [String], default: [] })
  occasions: string[];

  @Prop({ type: [String], default: [] })
  styles: string[];

  @Prop(raw({}))
  category_type: Record<string, any>;
}

export const TaxonomySchema = SchemaFactory.createForClass(Taxonomy);
