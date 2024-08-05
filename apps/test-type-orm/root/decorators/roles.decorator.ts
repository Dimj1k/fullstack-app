import { ROLE } from '../entities/user/user.entity'
import { Reflector } from '@nestjs/core'

export const ROLES_KEY = 'roles'
export const Roles = Reflector.createDecorator<ROLE[]>({ key: ROLES_KEY })
