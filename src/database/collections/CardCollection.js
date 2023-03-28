import Collection from '../Collection'


export default class CardCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'cards', 'cardId')
    }

}
