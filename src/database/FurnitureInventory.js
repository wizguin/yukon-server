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

}
