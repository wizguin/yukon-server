import type User from '@objects/user/User'

type IndexKey<Record> = Extract<keyof Record, string>

export default abstract class BaseCollection<Record> {

    user: User
    indexKey: IndexKey<Record>
    collection: Map<number, Record>

    constructor(user: User, records: Record[], indexKey: IndexKey<Record>) {
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

    abstract add(...args: (number | string | undefined)[]): void

    remove(key: number) {
        this.collection.delete(key)
    }

    collect(record: Record) {
        const indexValue = record[this.indexKey]

        if (typeof indexValue === 'number') {
            this.collection.set(indexValue, record)

        } else {
            console.error('Record could not be added to collection', { record })
        }
    }

    collectRecords(records: Record[]) {
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
