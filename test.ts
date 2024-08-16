import { hashSync } from 'bcrypt'

type ObjectKeys = string | number | symbol

class Chainable1<T extends Object> {
    constructor(private chain: T) {}

    add<K extends ObjectKeys, V>(
        key: K,
        value: V,
    ): Chainable1<T & { [P in K]: V }> {
        return new Chainable1({ ...this.chain, key: value } as T & {
            [P in K]: V
        })
    }

    get(key: ObjectKeys): Chainable1<T>['chain'][keyof T] {
        return this.chain[key]
    }
}

console.log(hashSync('tes1t', 10))
