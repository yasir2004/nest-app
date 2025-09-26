import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ collection: 'Products', versionKey: false })
export class Product {
  @Prop({ required: true, unique: true })
  product_id: string;

  @Prop({ required: true })
  product_name: string;

  @Prop({ required: true })
  brand_slug: string;

  @Prop({ type: [String], default: [] })
  gender: string[];

  @Prop({ required: true })
  category: string;

  @Prop()
  product_type: string;

  @Prop({ type: Object })
  attributes: Record<string, any>;

  @Prop({ type: [String], default: [] })
  occasions: string[];

  @Prop({ type: [String], default: [] })
  styles: string[];

  @Prop({ type: Array, default: [] })
  variants: any[];

  @Prop()
  primary_variant_id?: string;

  @Prop({ default: Date.now })
  created_at?: Date;

  @Prop({ default: Date.now })
  updated_at?: Date;

  @Prop({ default: true })
  is_active?: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
