import PrismaCollection from '@database/PrismaCollection'

import { cards } from '@data'
import type GameUser from '@objects/user/GameUser'
import PrismaDatabase from '@database/PrismaDatabase'
import type User from '@objects/user/User'

import type { Card } from '../../generated/prisma/client'

const starterDeckId = 821

export default class CardCollection extends PrismaCollection<Card> {

    constructor(user: User, records: Card[]) {
        super(user, records, 'cardId')
    }

    // Owned cards * their quantities
    get deck() {
        const deck: number[] = []

        for (const { cardId, quantity } of this.values) {
            deck.push(...Array(quantity).fill(cardId))
        }

        return deck
    }

    get hasCards() {
        const hasStarterDeck = (this.user as GameUser).inventory.includes(starterDeckId)
        const hasCards = this.count > 0

        return hasStarterDeck && hasCards
    }

    async add(cardId: number) {
        if (!(cardId in cards)) {
            return
        }

        try {
            this.collect(await PrismaDatabase.card.create({
                data: {
                    userId: this.user.id,
                    cardId
                }
            }))

        } catch (error) {
            console.error(error)
        }
    }

    toJSON() {
        return Array.from(this.values, ({ cardId, quantity }) => {
            const { powerId, element, color, value } = cards[cardId]

            return {
                id: cardId,
                powerId,
                element,
                color,
                value,
                quantity
            }
        })
    }

}
