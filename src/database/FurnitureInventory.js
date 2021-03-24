export default class FurnitureInventory {

    constructor(user, furnitures, inventory) {
        this.user = user
        this.db = user.db
        this.crumbs = furnitures
        this.list = inventory
    }

    includes(item) {
        return this.list.includes(item)
    }

}
