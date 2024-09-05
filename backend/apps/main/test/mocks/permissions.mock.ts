import { hashSync } from 'bcrypt'

export const password = hashSync('test', 10)

export const permissionBook = {
    nameBook: 'permBook',
    description: 'book mock',
    genres: ['mock', 'permission'],
}

export const adminUser = {
    email: 'admin@admin.test',
    password: 'test',
}

export const noAdminUser = {
    email: 'noAdmin@test.test',
    password: 'test',
}
