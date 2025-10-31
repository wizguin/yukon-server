import Collection from '../Collection'

import type GameUser from '@objects/user/GameUser'

export default class IgnoreCollection extends Collection {

    constructor(user: GameUser, models: any[]) {
        super(user, models, 'ignores', 'ignoreId')
    }

    add(id: number) {
        super.add({ userId: this.user.id, ignoreId: id })
    }

    toJSON() {
        const ignores = []

        for (const ignore in this.collection) {
            const username = this.collection[ignore].user.username

            ignores.push({ id: parseInt(ignore), username })
        }

        return ignores
    }

}
