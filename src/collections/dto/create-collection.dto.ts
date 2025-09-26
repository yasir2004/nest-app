// src/collections/dto/create-collection.dto.ts
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  brand_slug: string;

  @IsString()
  collection_slug: string;

  @IsString()
  collection_name: string;

  @IsArray()
  @IsOptional()
  layouts?: any[];

  @IsArray()
  @IsOptional()
  product_grid?: string[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsObject()
  @IsOptional()
  rules?: Record<string, any>;
}
