import GamePlugin from '@plugin/GamePlugin'

import data from '@data/data'


export default class Sensei extends GamePlugin {

    constructor(handler) {
        super(handler)

        this.events = {
            'add_starter_deck': this.addStarterDeck
        }

        this.starterDeckId = 821
        this.starterDeck = this.crumbs.items[this.starterDeckId]
    }

    addStarterDeck(args, user) {
        if (user.inventory.includes(this.starterDeckId)) {
            return
        }

        const deck = data.decks[this.starterDeckId]

        for (const card of deck) {
            if (data.cards[card].powerId === 0) {
                user.cards.add(card)
            }
        }

        const powerCards = deck.filter(card => data.cards[card].powerId > 0)

        const randomPowerCard = powerCards[Math.floor(Math.random() * powerCards.length)]

        user.cards.add(randomPowerCard)

        user.inventory.add(this.starterDeckId)
        user.send('add_item', { item: this.starterDeckId, name: this.starterDeck.name, slot: 'award', coins: user.coins })
    }

}
