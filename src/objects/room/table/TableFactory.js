import FourTable from './FourTable'


export default class TableFactory {

    static types = {
        'four': FourTable
    }

    static createTable(id, table, room) {
        return new this.types[table.game](id, table, room)
    }

}
