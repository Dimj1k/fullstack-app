import { SetMetadata } from '@nestjs/common'
import { ROLE } from '../entities/user/user.entity'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: ROLE[]) => SetMetadata(ROLES_KEY, roles)
