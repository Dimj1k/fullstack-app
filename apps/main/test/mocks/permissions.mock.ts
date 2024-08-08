export const adminRegistration = {
    email: 'super_user@super.user',
    password: 'super_user',
    passwordConfirm: 'super_user',
}

export const adminLogin = {
    email: adminRegistration.email,
    password: adminRegistration.password,
}

export const noAdminRegistration = {
    email: 'client@client.test',
    password: 't1t12',
    passwordConfirm: 't1t12',
}

export const noAdminLogin = {
    email: noAdminRegistration.email,
    password: noAdminRegistration.password,
}
