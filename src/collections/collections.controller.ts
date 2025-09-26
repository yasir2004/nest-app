import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { ClerkGuard } from '../auth/clerk.guard';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  // Get all collections for a brand (protected)
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

    // Check ownership
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

  // ✅ Create a new collection (protected)
  @UseGuards(ClerkGuard)
  @Post()
  async createCollection(@Body() body: CreateCollectionDto, @Req() req: any) {
    const clerkUserId = req.user?.sub || req.user?.user_id;

    // enforce ownership of brand
    const authorized = await this.collectionsService.findByBrandAndUser(
      body.brand_slug,
      clerkUserId,
    );
    if (!authorized) return { error: 'Unauthorized' };

    return this.collectionsService.create(body);
  }

  // Update collection (protected)
  @UseGuards(ClerkGuard)
  @Put(':brand_slug/:collection_slug')
  async saveCollection(
    @Param('brand_slug') brand_slug: string,
    @Param('collection_slug') collection_slug: string,
    @Body() body: UpdateCollectionDto,
    @Req() req: any,
  ) {
    const clerkUserId = req.user?.sub || req.user?.user_id;

    // enforce ownership before update
    const authorized = await this.collectionsService.findByBrandAndUser(
      brand_slug,
      clerkUserId,
    );
    if (!authorized) return { error: 'Unauthorized' };

    return this.collectionsService.upsert(brand_slug, collection_slug, body);
  }
}
