import { applyDecorators, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { JwtGuard } from '../guards/jwt.guard'

export function UserResources() {
    return applyDecorators(
        UseGuards(JwtGuard),
        ApiBearerAuth(),
        ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    )
}
