import { createReadStream, PathLike } from 'fs'
import * as readline from 'readline/promises'
import { IContentMail } from '../interfaces'
import { readFile } from 'fs/promises'
import { join } from 'path'
import {
    Indexes,
    jsonIndexesName,
    varNameInThisLine,
} from './create-indexes-template.util'
import { isExists } from './is-exists.util'
import { readJson } from 'fs-extra'

export const loadMailtemplate = async (
    dirTotemplate: PathLike,
    content: IContentMail['content'],
) => {
    dirTotemplate = dirTotemplate.toString()
    let pathToJson = join(dirTotemplate, jsonIndexesName)
    if (!(await isExists(pathToJson)))
        return oldAlgorithm(dirTotemplate, content)
    let indexes = (await readJson(pathToJson, {
        encoding: 'utf-8',
    })) as Indexes
    const rl = readline.createInterface({
        input: createReadStream(join(dirTotemplate, 'template.html'), {
            encoding: 'utf-8',
        }),
        crlfDelay: Infinity,
    })
    try {
        let [lineno, mail] = [0, '']
        for await (let line of rl) {
            let index = indexes[(++lineno).toString()] as
                | undefined
                | varNameInThisLine[]
            if (index) line = await changeLine(index, content, line)
            mail += line
        }
        return mail
    } finally {
        rl.close()
    }
}

async function changeLine(
    index: varNameInThisLine[],
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
    dirTotemplate: PathLike,
    content: IContentMail['content'],
) => {
    let readed = await readFile(
        join(dirTotemplate.toString(), 'template.html'),
        {
            encoding: 'utf-8',
        },
    )
    for (let [key, value] of Object.entries(content)) {
        readed = readed.replace(`{ ${key} }`, value)
    }
    return readed
}
