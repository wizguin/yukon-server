import CardMatchmaker from './CardMatchmaker'


export default class TableFactory {

    static types = {
        'card': CardMatchmaker
    }

    static createMatchmaker(matchmaker, room) {
        return new this.types[matchmaker.game](matchmaker, room)
    }

}
