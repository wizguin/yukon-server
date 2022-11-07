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

    collect(models) {
        for (let model of models) {
            this.collection[model[this.indexKey]] = model
        }
    }

    add(record) {
        this.model.create(record)
            .then((model) => {
                this.collection[model[this.indexKey]] = model

            })
            .catch((error) => {
                this.handler.error(error)
            })
    }

    remove(key) {
        this.collection[key].destroy()

        delete this.collection[key]
    }

    includes(key) {
        return key in this.collection
    }

    toJSON() {
        return Object.keys(this.collection).map(key => parseInt(key))
    }

}
