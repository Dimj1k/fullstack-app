export interface ICookie {
    name: string
    value: string
    path: string
    expires: Date
    httpOnly: boolean
    secure: boolean
    SameSite: 'lax' | 'strict' | 'none'
}

function split(
    str: string,
    splitter: string,
    limit: number = Infinity,
): string[] {
    let splitting = []
    let beforeSpliter = ''
    for (let char of str) {
        if (char !== splitter) beforeSpliter += char
        else {
            if (splitting.length !== limit) {
                splitting.push(beforeSpliter)
                beforeSpliter = ''
            } else beforeSpliter += splitter
        }
    }
    splitting.push(beforeSpliter)
    return splitting
}

export function parseCookie(cookie: string): ICookie {
    let [name, values] = split(cookie, '=', 1)
    let [value, path, expires, ...options] = values.split('; ')
    return {
        name,
        value,
        path: path.split('=')[1],
        expires: new Date(expires.split('=')[1]),
        httpOnly: options.includes('HttpOnly'),
        secure: options.includes('Secure'),
        SameSite: options.at(-1).split('=')[1].toLowerCase() as
            | 'lax'
            | 'strict'
            | 'none',
    }
}
