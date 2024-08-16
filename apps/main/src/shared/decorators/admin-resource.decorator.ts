import { applyDecorators, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { ROLE } from '../entities/user'
import { Roles } from './roles.decorator'
import { RolesGuard } from '../guards'

export function AdminResources() {
    return applyDecorators(
        UseGuards(RolesGuard),
        Roles([ROLE.ADMIN]),
        ApiBearerAuth(),
        ApiUnauthorizedResponse({ description: 'Forbidden' }),
    )
}
