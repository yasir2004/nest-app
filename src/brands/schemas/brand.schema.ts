import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ collection: 'Brands', versionKey: false })
export class Brand {
  @Prop({ required: true, unique: true })
  brand_slug: string;

  @Prop({ required: true })
  brand_name: string;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop()
  logo_url?: string;

  @Prop({ type: [String], default: [] })
  locations: string[];

  @Prop()
  about?: string;

  @Prop()
  website_url?: string;

  @Prop({ type: Array, default: [] })
  users: any[]; // keep simple; Clerk user references

  @Prop({ type: Boolean, default: true })
  is_active: boolean;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
