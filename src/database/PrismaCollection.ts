import type User from '@objects/user/User'

type IndexKey<R> = Extract<keyof R, string>

export default abstract class PrismaCollection<R> {

    user: User
    indexKey: IndexKey<R>
    collection: Map<number, R>

    constructor(user: User, records: R[], indexKey: IndexKey<R>) {
        this.user = user
        this.indexKey = indexKey

        this.collection = new Map()

        this.collectRecords(records)
    }

    get keys() {
        return this.collection.keys()
    }

    get values() {
        return this.collection.values()
    }

    get count() {
        return this.collection.size
    }

    abstract add(...args: (number | string)[]): void

    remove(key: number) {
        this.collection.delete(key)
    }

    collect(record: R) {
        const indexValue = record[this.indexKey]

        if (typeof indexValue === 'number') {
            this.collection.set(indexValue, record)

        } else {
            console.error('Record could not be added to collection', { record })
        }
    }

    collectRecords(records: R[]) {
        records.forEach(record => this.collect(record))
    }

    get(key: number) {
        return this.collection.get(key)
    }

    includes(key: number) {
        return this.collection.has(key)
    }

    toJSON(): any {
        return [...this.keys]
    }

}
