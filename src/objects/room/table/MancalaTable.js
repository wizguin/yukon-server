import BaseTable from './BaseTable'


export default class MancalaTable extends BaseTable {

    init() {
        super.init()

        this.map = [
            4, 4, 4, 4, 4, 4, 0,
            4, 4, 4, 4, 4, 4, 0
        ]
    }

}
