import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { ClerkGuard } from '../auth/clerk.guard';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // Example protected route: get brands for logged-in user
  @UseGuards(ClerkGuard)
  @Get('me')
  async getMyBrands(@Req() req: any) {
    const clerkUserId = req.user?.sub || req.user?.user_id || req.user?.sub;
    return this.brandsService.findByUserClerkId(clerkUserId);
  }
}
