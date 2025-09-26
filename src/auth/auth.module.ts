// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ClerkGuard } from './clerk.guard';

@Module({
  providers: [ClerkGuard],
  exports: [ClerkGuard],
})
export class AuthModule {}
