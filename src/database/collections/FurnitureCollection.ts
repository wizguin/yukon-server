import BaseCollection from '@database/BaseCollection'

import { FurnitureLimitError } from '@utils/error'
import type User from '@objects/user/User'

import type { FurnitureInventory } from '../../generated/prisma/client'

export default class FurnitureCollection extends BaseCollection<FurnitureInventory> {

    constructor(user: User, records: FurnitureInventory[]) {
        super(user, records, 'itemId')
    }

    async add(itemId: number, cost: number, max: number) {
        const record = await this.user.purchase(cost, async tx => {
            // Ensure row exists
            await tx.$executeRaw`
                INSERT IGNORE INTO furniture_inventories (userId, itemId, quantity)
                VALUES (${this.user.id}, ${itemId}, 0)
            `

            // Increment if below max
            const updated = await tx.furnitureInventory.updateMany({
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
                throw new FurnitureLimitError()
            }

            // Get updated record
            return tx.furnitureInventory.findUniqueOrThrow({
                where: {
                    userId_itemId: {
                        userId: this.user.id,
                        itemId
                    }
                }
            })
        })

        this.collect(record)

        return record
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
