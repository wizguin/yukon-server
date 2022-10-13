import Collection from '../Collection'


export default class FurnitureCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'furnitureInventories', 'itemId')
    }

    get furnitures() {
        return this.handler.crumbs.furnitures
    }

    getQuantity(item) {
        return this.collection[item].quantity
    }

    add(item) {
        if (this.includes(item)) {
            let quantity = this.getQuantity(item)

            // Maxed quantity
            if (quantity >= this.furnitures[item].max) {
                return false
            }

            this.collection[item].increment({ quantity: 1 })

        } else {
            // New item
            super.add({ userId: this.user.id, itemId: item, quantity: 1 })
        }

        return true
    }

    toJSON() {
        let furniture = {}

        for (let f in this.collection) {
            furniture[f] = this.collection[f].quantity
        }

        return furniture
    }

}
