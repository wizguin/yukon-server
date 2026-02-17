import BaseCollection from '@database/BaseCollection'

import { cards } from '@data'
import type GameUser from '@objects/user/GameUser'
import Database from '@database/Database'
import type User from '@objects/user/User'

import type { Card } from '../../generated/prisma/client'

const starterDeckId = 821

export default class CardCollection extends BaseCollection<Card> {

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

    async add(cardId: number, quantity: number = 1) {
        if (!(cardId in cards)) {
            return
        }

        try {
            this.collect(await Database.card.upsert({
                where: {
                    userId_cardId: {
                        userId: this.user.id,
                        cardId
                    }
                },
                update: {
                    quantity: { increment: quantity }
                },
                create: {
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
