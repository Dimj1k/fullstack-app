type ObjectKeys = string | number | symbol

export class Chainable<Values, T = {}> {
    constructor(private chain: T) {}

    add<K extends ObjectKeys, V extends Values>(
        key: K,
        value: V,
    ): Chainable<Values, T & { [P in K]: Values }> {
        return new Chainable({ ...this.chain, [key]: value } as T & {
            [P in K]: Values
        })
    }

    get(key: ObjectKeys): Chainable<Values, T>['chain'][keyof T] {
        return this.chain[key]
    }
}
