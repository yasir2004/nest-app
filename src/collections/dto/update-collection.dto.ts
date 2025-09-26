import { IsArray, IsBoolean, IsObject, IsString } from 'class-validator';

export class UpdateCollectionDto {
  @IsString()
  collection_name: string;

  @IsBoolean()
  is_active: boolean;

  @IsArray()
  product_grid: string[];

  @IsArray()
  layouts: any[];

  @IsObject()
  rules: Record<string, any>;
}
