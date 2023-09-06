import Collection from '../Collection'


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

    add(card) {
        if (this.includes(card)) {
            this.collection[card].increment({ quantity: 1 })

        } else {
            super.add({ userId: this.user.id, cardId: card, quantity: 1, memberQuantity: 0 })
        }
    }

}
