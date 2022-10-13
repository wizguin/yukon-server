import Collection from '../Collection'


export default class InventoryCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'inventories', 'itemId')
    }

    add(item) {
        super.add({ userId: this.user.id, itemId: item })
    }

}
