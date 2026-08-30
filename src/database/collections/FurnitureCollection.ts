import BaseCollection from '@database/BaseCollection'

import Database from '@database/Database'
import { furniture } from '@data'
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

        const { max } = furniture[itemId]

        try {
            // Ensure row exists
            await Database.$executeRaw`
                INSERT IGNORE INTO furniture_inventories (userId, itemId, quantity)
                VALUES (${this.user.id}, ${itemId}, 0)
            `

            // Increment if below max
            const updated = await Database.furnitureInventory.updateMany({
                where: {
                    userId: this.user.id,
                    itemId,
                    quantity: { lt: max }
                },
                data: {
                    quantity: { increment: 1 }
                }
            })

            if (updated.count === 0) {
                return false
            }

            // Get updated record
            const record = await Database.furnitureInventory.findUniqueOrThrow({
                where: {
                    userId_itemId: {
                        userId: this.user.id,
                        itemId
                    }
                }
            })

            this.collect(record)

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
