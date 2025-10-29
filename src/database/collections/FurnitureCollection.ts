import Collection from '../Collection'

import type GameUser from '@objects/user/GameUser'


export default class FurnitureCollection extends Collection {

    constructor(user: GameUser, models: any[]) {
        super(user, models, 'furnitureInventories', 'itemId')
    }

    get furnitures() {
        // @ts-expect-error temp
        return this.handler.crumbs.furnitures
    }

    getQuantity(item: any) {
        return this.collection[item].quantity
    }

    add(item: number) {
        if (this.includes(item)) {
            let quantity = this.getQuantity(item)

            // Maxed quantity
            if (quantity >= this.furnitures[item].max) {
                return false
            }

            this.collection[item].update({ quantity: quantity + 1 })

        } else {
            // New item
            super.add({ userId: this.user.id, itemId: item, quantity: 1 })
        }

        return true
    }

    toJSON() {
        let furniture = {}

        for (let f in this.collection) {
            // @ts-expect-error temp
            furniture[f] = this.collection[f].quantity
        }

        return furniture
    }

}
