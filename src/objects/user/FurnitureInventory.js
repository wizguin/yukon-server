export default class FurnitureInventory {

    constructor(user, inventory) {
        this.user = user
        this.db = user.db
        this.furnitures = user.crumbs.furnitures
        this.list = inventory
    }

    includes(item) {
        return item in this.list
    }

    add(item) {
        if (this.includes(item)) {
            // Already maxed quantity
            if (this.list[item] >= this.furnitures[item].max) {
                return false
            }

            // Increase quantity
            this.list[item]++
            this.db.furnitureInventories.update({ quantity: this.list[item] },
                { where: { userId: this.user.data.id, itemId: item }})

        } else {
            // New item
            this.list[item] = 1

            this.db.furnitureInventories.create({ userId: this.user.data.id, itemId: item, quantity: 1 })
        }

        return true
    }

}
