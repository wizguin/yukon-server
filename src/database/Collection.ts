import type BaseHandler from '../handlers/BaseHandler'
import type Database from './Database'
import type GameUser from '@objects/user/GameUser'

export default class Collection {

    user: GameUser
    indexKey: string

    db: Database
    model: any
    handler: BaseHandler
    collection: Record<string, any> = {}

    constructor(user: GameUser, models: any[], model: string, indexKey: string) {
        this.user = user
        this.indexKey = indexKey

        this.db = user.db
        // @ts-expect-error temp
        this.model = user.db[model]
        this.handler = user.handler

        this.collect(models)
    }

    get keys() {
        return Object.keys(this.collection)
    }

    get values() {
        return Object.values(this.collection)
    }

    get count() {
        return this.keys.length
    }

    collect(models: any[]) {
        for (const model of models) {
            this.addModel(model)
        }
    }

    add(record: any) {
        this.model.create(record)
            .then((model: any) => {
                this.addModel(model)

            })
            .catch((error: any) => {
                this.handler.error(error)
            })
    }

    addModel(model: any) {
        this.collection[model[this.indexKey]] = model
    }

    remove(key: string | number) {
        if (this.includes(key)) {
            this.collection[key].destroy()

            delete this.collection[key]
        }
    }

    includes(key: string | number) {
        return key in this.collection
    }

    get(key: string | number) {
        return this.includes(key) ? this.collection[key] : null
    }

    toJSON(): any {
        return this.keys.map(key => parseInt(key))
    }

}
