import { hashSync } from 'bcrypt'

export let password = hashSync('test', 10)

export const adminUser = {
    email: 'admin@admin.test',
    password: 'test',
}

export const noAdminUser = {
    email: 'noAdmin@test.test',
    password: 'test',
}
