import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CollectionDocument = Collection & Document;

@Schema({ collection: 'Collections', versionKey: false })
export class Collection {
  @Prop({ required: true })
  brand_slug: string;

  @Prop({ required: true, unique: true })
  collection_slug: string;

  @Prop({ required: true })
  collection_name: string;

  @Prop({ type: Array, default: [] })
  layouts: any[];

  @Prop({ type: Array, default: [] })
  product_grid: string[];

  @Prop({ default: Date.now })
  updated_at?: Date;

  @Prop({ type: Boolean, default: true })
  is_active: boolean;

  @Prop(raw({}))
  rules: Record<string, any>;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
