import Collection from '../Collection'


export default class IgnoreCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'ignores', 'ignoreId')
    }

    add(id) {
        super.add({ userId: this.user.id, ignoreId: id })
    }

    toJSON() {
        let ignores = []

        for (let ignore in this.collection) {
            let username = this.collection[ignore].user.username

            ignores.push({ id: parseInt(ignore), username: username })
        }

        return ignores
    }

}
