import {PathLike, StatsBase} from 'fs'
import {access, constants, lstat} from 'fs/promises'
import {join} from 'path'

type PickByType<T, V> = {
	[key in keyof T as T[key] extends V ? key : never]: V
}

type KeysWithoutIs<T> = T extends `${'is'}${infer Key}` ? Key : never

export const channelsJson = join(__dirname, 'channels.json')

export const isExists = async (
	path: PathLike,
	itIs?: KeysWithoutIs<keyof PickByType<StatsBase<number>, () => boolean>>,
	logging: boolean = false,
) => {
	try {
		if (!itIs) {
			await access(path, constants.F_OK)
			return true
		}
		if ((await lstat(path))[`is${itIs}`]()) {
			return true
		}
		logging && console.warn(`${path} - не ${itIs}`)
		return false
	} catch {
		logging && console.error(`${path} - не существует`)
		return false
	}
}
