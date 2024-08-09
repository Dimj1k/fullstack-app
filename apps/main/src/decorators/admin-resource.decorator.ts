import { applyDecorators, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { ROLE } from '../entities/user/user.entity'
import { Roles } from './roles.decorator'
import { RolesGuard } from '../guards/role.guard'

export function AdminResources() {
    return applyDecorators(
        UseGuards(RolesGuard),
        Roles([ROLE.ADMIN]),
        ApiBearerAuth(),
        ApiUnauthorizedResponse({ description: 'Forbidden' }),
    )
}
