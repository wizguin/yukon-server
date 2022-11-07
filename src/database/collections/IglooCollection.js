import Collection from '../Collection'


export default class IglooCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'iglooInventories', 'iglooId')
    }

    add(igloo) {
        super.add({ userId: this.user.id, iglooId: igloo })
    }

}
