import Collection from '../Collection'

import type GameUser from '@objects/user/GameUser'

export default class InventoryCollection extends Collection {

    constructor(user: GameUser, models: any[]) {
        super(user, models, 'inventories', 'itemId')
    }

    add(item: number) {
        super.add({ userId: this.user.id, itemId: item })
    }

}
