import { PathLike, StatsBase } from 'fs'
import { lstat } from 'fs/promises'

type PickByType<T, V> = {
    [key in keyof T as T[key] extends V ? key : never]: V
}

type KeysWithoutIs<T> = T extends `${'is'}${infer Key}` ? Key : never

export const isExists = async (
    path: PathLike,
    itIs?: KeysWithoutIs<keyof PickByType<StatsBase<number>, () => boolean>>,
    logging: boolean = false,
) => {
    try {
        if (!itIs) {
            await lstat(path)
            return true
        }
        if ((await lstat(path))[`is${itIs}`]()) {
            return true
        }
        logging && console.warn(`${path} - не ${itIs}`)
        return false
    } catch {
        console.error(`${path} - не существует`)
        return false
    }
}
