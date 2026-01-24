import PrismaCollection from '@database/PrismaCollection'

import PrismaDatabase from '@database/PrismaDatabase'
import type User from '@objects/user/User'

import type { Inventory } from '../../generated/prisma/client'

export default class InventoryCollection extends PrismaCollection<Inventory> {

    constructor(user: User, records: Inventory[]) {
        super(user, records, 'itemId')
    }

    async add(itemId: number) {
        try {
            this.collect(await PrismaDatabase.inventory.create({
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
