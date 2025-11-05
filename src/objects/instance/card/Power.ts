import type Card from './ninja/Card'

export default class Power {

    seat: number
    card: Card
    id: number

    constructor(seat: number, card: Card) {
        this.seat = seat
        this.card = card

        this.id = card.powerId
    }

}
