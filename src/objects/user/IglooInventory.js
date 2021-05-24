export default class IglooInventory {

    constructor(user, inventory) {
        this.user = user
        this.db = user.db
        this.igloos = user.crumbs.igloos
        this.list = inventory
    }

    includes(item) {
        return this.list.includes(item)
    }

}
