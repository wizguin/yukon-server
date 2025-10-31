import FourTable from './FourTable'
import MancalaTable from './MancalaTable'
import type Room from '../Room'

type TableType = keyof typeof TableFactory.types

export default class TableFactory {

    static types = {
        four: FourTable,
        mancala: MancalaTable
    }

    static createTable(table: any, room: Room) {
        return new this.types[table.game as TableType](table, room)
    }

}
