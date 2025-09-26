import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  product_id: string;

  @IsString()
  product_name: string;

  @IsString()
  brand_slug: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gender?: string[];

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  product_type?: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  occasions?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  styles?: string[];

  @IsArray()
  @IsOptional()
  variants?: any[];

  @IsString()
  @IsOptional()
  primary_variant_id?: string;

  @IsOptional()
  created_at?: Date;

  @IsOptional()
  updated_at?: Date;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
