import BaseCollection from '@database/BaseCollection'

import type User from '@objects/user/User'

import type { Inventory } from '../../generated/prisma/client'

export default class InventoryCollection extends BaseCollection<Inventory> {

    constructor(user: User, records: Inventory[]) {
        super(user, records, 'itemId')
    }

    async add(itemId: number, cost: number) {
        const record = await this.user.purchase(cost, tx =>
            tx.inventory.create({
                data: {
                    userId: this.user.id,
                    itemId
                }
            })
        )

        this.collect(record)

        return record
    }

}
