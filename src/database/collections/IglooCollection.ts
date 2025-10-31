import Collection from '../Collection'

import type GameUser from '@objects/user/GameUser'

export default class IglooCollection extends Collection {

    constructor(user: GameUser, models: any[]) {
        super(user, models, 'iglooInventories', 'iglooId')
    }

    add(igloo: number) {
        super.add({ userId: this.user.id, iglooId: igloo })
    }

}
