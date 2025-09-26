import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { ClerkGuard } from '../auth/clerk.guard';

import { Req } from '@nestjs/common';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  // Get all collections for a brand (protected by ClerkGuard)
  @UseGuards(ClerkGuard)
  @Get(':brand_slug')
  async getCollections(
    @Param('brand_slug') brand_slug: string,
    @Req() req: any,
  ) {
    const clerkUserId = req.user?.sub || req.user?.user_id;
    const collections = await this.collectionsService.findByBrandAndUser(
      brand_slug,
      clerkUserId,
    );
    if (!collections) return { error: 'Unauthorized or brand not found' };
    return collections;
  }

  // Get a single collection (protected)
  @UseGuards(ClerkGuard)
  @Get(':brand_slug/:collection_slug')
  async getCollection(
    @Param('brand_slug') brand_slug: string,
    @Param('collection_slug') collection_slug: string,
    @Req() req: any,
  ) {
    const clerkUserId = req.user?.sub || req.user?.user_id;

    // Check if user belongs to brand
    const authorized = await this.collectionsService.findByBrandAndUser(
      brand_slug,
      clerkUserId,
    );
    if (!authorized) return { error: 'Unauthorized' };

    const col = await this.collectionsService.findOne(
      brand_slug,
      collection_slug,
    );
    if (!col) return { error: 'Collection not found' };
    return col;
  }

  // Save/update collection (already protected)
  @UseGuards(ClerkGuard)
  @Put(':brand_slug/:collection_slug')
  async saveCollection(
    @Param('brand_slug') brand_slug: string,
    @Param('collection_slug') collection_slug: string,
    @Body() body: UpdateCollectionDto,
    @Req() req: any,
  ) {
    const clerkUserId = req.user?.sub || req.user?.user_id;

    // Optional: enforce ownership check before update
    const authorized = await this.collectionsService.findByBrandAndUser(
      brand_slug,
      clerkUserId,
    );
    if (!authorized) return { error: 'Unauthorized' };

    return this.collectionsService.upsert(brand_slug, collection_slug, body);
  }
}
