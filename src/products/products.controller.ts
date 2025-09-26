import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ClerkGuard } from '../auth/clerk.guard';

@Controller('products')
@UseGuards(ClerkGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products?brand=...&id=...&ids=...&category=...
  @Get()
  async getProducts(
    @Query('brand') brand: string,
    @Query('id') id: string,
    @Query('ids') ids: string,
    @Query('category') category: string,
    @Req() req: any,
  ) {
    const clerkUserId = req.user?.sub || req.user?.user_id;

    if (!brand) return { error: 'brand is required' };

    // single product by id
    if (id) {
      return this.productsService.findByIdAndUser(brand, id, clerkUserId);
    }

    // multiple products by ids
    if (ids) {
      const idList = ids
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return this.productsService.findByIdsAndUser(brand, idList, clerkUserId);
    }

    // products by brand + category
    if (category) {
      return this.productsService.findByBrandAndCategoryAndUser(
        brand,
        category,
        clerkUserId,
      );
    }

    // fallback: return all products of brand
    return this.productsService.findByBrandAndUser(brand, clerkUserId);
  }

  // POST /products?brand=...
  @Post()
  async createProduct(
    @Query('brand') brand: string,
    @Body() dto: CreateProductDto,
    @Req() req: any,
  ) {
    const clerkUserId = req.user?.sub || req.user?.user_id;
    if (!brand) return { error: 'brand is required' };

    return this.productsService.createForBrand(brand, dto, clerkUserId);
  }

  // PATCH /products?id=...&brand=...
  @Patch()
  async updateProduct(
    @Query('brand') brand: string,
    @Query('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: any,
  ) {
    const clerkUserId = req.user?.sub || req.user?.user_id;
    if (!brand || !id) return { error: 'brand and id are required' };

    return this.productsService.updateForBrand(brand, id, dto, clerkUserId);
  }

  // DELETE /products?id=...&brand=...
  @Delete()
  async deleteProduct(
    @Query('brand') brand: string,
    @Query('id') id: string,
    @Req() req: any,
  ) {
    const clerkUserId = req.user?.sub || req.user?.user_id;
    if (!brand || !id) return { error: 'brand and id are required' };

    return this.productsService.removeForBrand(brand, id, clerkUserId);
  }
}
