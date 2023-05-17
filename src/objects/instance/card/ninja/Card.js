import { cards } from '@data/data'


export default class Card {

    constructor(id) {
        Object.assign(this, cards[id])

        this.originalElement = cards[id].element
    }

}
