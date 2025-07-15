import { Controller, Get, UseGuards } from '@nestjs/common';

import { RoleService } from './role.service';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard';
import { AuthGuard } from '../auth/auth.guard';

@Controller("roles")
export class RoleController{
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(AuthGuard,RateLimitGuard)
  get() {
    return this.roleService.get();
  }
}
