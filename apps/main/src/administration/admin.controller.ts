import { Controller, Param, Patch } from '@nestjs/common'
import { AdminService } from './admin.service'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import { AdminResources } from '../decorators'

@AdminResources()
@ApiTags('admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @ApiParam({ name: 'email' })
    @Patch('/upgradeToAdmin/:email')
    async upgradeToAdmin(@Param('email') email: string) {
        return this.adminService.upgradeToAdmin(email)
    }

    @ApiParam({ name: 'email' })
    @Patch('/dropAdmin/:email')
    async dropAdmin(@Param('email') email: string) {
        return this.adminService.dropAdmin(email)
    }
}
