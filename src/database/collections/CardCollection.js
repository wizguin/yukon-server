import Collection from '../Collection'


export default class CardCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'cards', 'cardId')
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
