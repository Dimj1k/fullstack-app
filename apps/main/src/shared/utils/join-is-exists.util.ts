import { join, parse } from 'path'
import { isExists } from './is-exists.util'

export const joinIsExists = async (...pathes: string[]) => {
    let [origName, num] = [pathes.pop(), 1]
    let name = origName
    while (true) {
        let path = join(...pathes, name)
        if (!(await isExists(path))) return path
        name = `${parse(origName).name} (${num++})${parse(origName).ext}`
    }
}
