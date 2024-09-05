import { createReadStream, PathLike } from 'fs'
import * as readline from 'readline/promises'
import { readFile } from 'fs/promises'
import { join } from 'path'
import {
    Indexes,
    jsonIndexesName,
    setAsyncDispose,
    varNameOnThisLine,
} from './create-indexes-template.util'
import { readJson } from 'fs-extra'
import { IContentMail } from '../../mailer'
import { isExists } from '../../shared/utils'

export const loadMailTemplate = async (
    dirToTemplate: PathLike,
    content: IContentMail['content'],
) => {
    dirToTemplate = dirToTemplate.toString()
    let pathToJson = join(dirToTemplate, jsonIndexesName)
    if (!(await isExists(pathToJson)))
        return oldAlgorithm(dirToTemplate, content)
    let indexes = (await readJson(pathToJson, {
        encoding: 'utf-8',
    })) as Indexes
    await using rl = setAsyncDispose(
        readline.createInterface({
            input: createReadStream(join(dirToTemplate, 'template.html'), {
                encoding: 'utf-8',
            }),
            crlfDelay: Infinity,
        }),
    )
    let [lineno, mail] = [0, '']
    for await (let line of rl) {
        let index = indexes[(++lineno).toString()] as
            | undefined
            | varNameOnThisLine[]
        if (index) line = changeLine(index, content, line)
        mail += line.trim()
    }
    return mail
}

function changeLine(
    index: varNameOnThisLine[],
    content: IContentMail['content'],
    line: string,
) {
    let [addCol, unUsed] = [0, 0]
    for (let search of index) {
        let oldLength = line.length
        line =
            line.slice(0, search.startCol + addCol) +
            (content[search.varName] ?? (unUsed++, '')) +
            line.slice(search.endCol + addCol)
        addCol = line.length - oldLength + addCol
    }
    return unUsed !== index.length ? line : ''
}

const oldAlgorithm = async (
    dirToTemplate: PathLike,
    content: IContentMail['content'],
) => {
    let readed = await readFile(
        join(dirToTemplate.toString(), 'template.html'),
        {
            encoding: 'utf-8',
        },
    )
    for (let [key, value] of Object.entries(content)) {
        readed = readed.replace(`{ ${key} }`, value)
    }
    return readed
}
