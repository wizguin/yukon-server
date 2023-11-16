import { cards } from '@data/data'

import pick from '@utils/pick'


export default class Card {

    constructor(id) {
        this.id = parseInt(id)

        const card = cards[id]

        this.powerId = card.powerId
        this.element = card.element
        this.color = card.color
        this.value = card.value

        this.originalElement = card.element
    }

    toJSON() {
        return pick(this,
            'id',
            'powerId',
            'element',
            'color',
            'value'
        )
    }

}
