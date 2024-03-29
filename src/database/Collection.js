export default class Collection {

    constructor(user, models, model, indexKey) {
        this.user = user
        this.indexKey = indexKey

        this.db = user.db
        this.model = user.db[model]
        this.handler = user.handler

        this.collection = {}

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

    collect(models) {
        for (let model of models) {
            this.addModel(model)
        }
    }

    add(record) {
        this.model.create(record)
            .then((model) => {
                this.addModel(model)

            })
            .catch((error) => {
                this.handler.error(error)
            })
    }

    addModel(model) {
        this.collection[model[this.indexKey]] = model
    }

    remove(key) {
        if (this.includes(key)) {
            this.collection[key].destroy()

            delete this.collection[key]
        }
    }

    includes(key) {
        return key in this.collection
    }

    get(key) {
        return this.includes(key) ? this.collection[key] : null
    }

    toJSON() {
        return this.keys.map(key => parseInt(key))
    }

}
