import BaseCollection from '@database/BaseCollection'

import Database from '@database/Database'
import type User from '@objects/user/User'

import type { Inventory } from '../../generated/prisma/client'

export default class InventoryCollection extends BaseCollection<Inventory> {

    constructor(user: User, records: Inventory[]) {
        super(user, records, 'itemId')
    }

    async add(itemId: number) {
        try {
            this.collect(await Database.inventory.create({
                data: {
                    userId: this.user.id,
                    itemId
                }
            }))

        } catch (error) {
            console.error(error)
        }
    }

}
