import Collection from '../Collection'

import { cards } from '@data/data'


export default class CardCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'cards', 'cardId')

        this.starterDeckId = 821
    }

    // Owned cards * their quantities
    get deck() {
        let deck = []

        Object.keys(this.collection).forEach(card => {
            const quantity = this.getQuantity(card)
            deck.push(...Array(quantity).fill(card))
        })

        return deck
    }

    get hasCards() {
        const hasStarterDeck = this.user.inventory.includes(this.starterDeckId)
        const hasCards = Object.keys(this.collection).length > 0

        return hasStarterDeck && hasCards
    }

    getQuantity(card) {
        return this.collection[card].quantity
    }

    add(card, quantity = 1) {
        if (this.includes(card)) {
            this.collection[card].update({ quantity: this.getQuantity(card) + quantity })

        } else {
            super.add({ userId: this.user.id, cardId: card, quantity: quantity, memberQuantity: 0 })
        }
    }

    toJSON() {
        return Object.keys(this.collection).map(cardId => this.cardToJSON(cardId))
    }

    cardToJSON(cardId) {
        const card = cards[cardId]

        return {
            id: parseInt(cardId),
            powerId: card.powerId,
            element: card.element,
            color: card.color,
            value: card.value,
            quantity: this.getQuantity(cardId)
        }
    }

}
