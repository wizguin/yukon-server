import BaseCollection from '@database/BaseCollection'

import { furniture } from '@data'
import Database from '@database/Database'
import type User from '@objects/user/User'

import type { FurnitureInventory } from '../../generated/prisma/client'

export default class FurnitureCollection extends BaseCollection<FurnitureInventory> {

    constructor(user: User, records: FurnitureInventory[]) {
        super(user, records, 'itemId')
    }

    async add(itemId: number) {
        if (!(itemId in furniture)) {
            return false
        }

        if (this.getQuantity(itemId) >= furniture[itemId].max) {
            return false
        }

        try {
            this.collect(await Database.furnitureInventory.upsert({
                where: {
                    userId_itemId: {
                        userId: this.user.id,
                        itemId
                    }
                },
                update: {
                    quantity: { increment: 1 }
                },
                create: {
                    userId: this.user.id,
                    itemId,
                    quantity: 1
                }
            }))

            return true

        } catch (error) {
            console.error(error)

            return false
        }
    }

    getQuantity(itemId: number) {
        return this.get(itemId)?.quantity ?? 0
    }

    toJSON() {
        const furniture: Record<number, number> = {}

        for (const itemId of this.keys) {
            furniture[itemId] = this.getQuantity(itemId)
        }

        return furniture
    }

}
