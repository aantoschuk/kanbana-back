import { Controller, Get } from '@nestjs/common';

import { RoleService } from './role.service';

@Controller("roles")
export class RoleController{
  constructor(private readonly roleService: RoleService) {}

  @Get()
  get() {
    return this.roleService.get();
  }
}
