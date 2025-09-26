import { Controller, Get, UseGuards } from '@nestjs/common';
import { TaxonomiesService } from './taxonomies.service';
import { ClerkGuard } from '../auth/clerk.guard';

@Controller('taxonomy')
export class TaxonomiesController {
  constructor(private readonly taxonomiesService: TaxonomiesService) {}

  @UseGuards(ClerkGuard)
  @Get()
  async getTaxonomy() {
    return this.taxonomiesService.getTaxonomy();
  }
}
