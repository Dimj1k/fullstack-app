import { PathLike } from 'fs'
import { readFile } from 'fs/promises'
import { IContentMail } from '../interfaces/content-mails.interface'

export const loadMailPattern = async (
    pattern: PathLike,
    content: IContentMail['content'],
) => {
    let readed = (await readFile(pattern, { encoding: 'utf-8' })).toString()
    for (let [key, value] of Object.entries(content)) {
        readed = readed.replace(`{ ${key} }`, value)
    }
    return readed
}
