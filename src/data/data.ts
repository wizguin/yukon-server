import { loadJson } from '@utils/loadJson'

import { type } from 'arktype'

const Card = type({
    name: 'string | number.integer',
    setId: 'number.integer',
    powerId: 'number.integer',
    element: '"f" | "w" | "s"',
    color: '"r" | "b" | "g" | "y" | "o" | "p"',
    value: 'number.integer'
})

const FlooringItem = type({
    name: 'string',
    cost: 'number.integer',
    patched: 'number.integer'
})

const FurnitureItem = type({
    name: 'string',
    type: 'number.integer',
    sort: 'number.integer',
    cost: 'number.integer',
    member: 'number.integer',
    bait: 'number.integer',
    patched: 'number.integer',
    max: 'number.integer'
})

const Igloo = type({
    name: 'string',
    cost: 'number.integer',
    patched: 'number.integer'
})

const Item = type({
    name: 'string',
    type: 'number.integer',
    cost: 'number.integer',
    member: 'number.integer',
    bait: 'number.integer',
    patched: 'number.integer',
    treasure: 'number.integer'
})

const Matchmaker = type({
    game: 'string'
})

const Pet = type({
    name: 'string',
    cost: 'number.integer',
    member: 'number.integer',
    ranPostcard: 'number.integer'
})

const Room = type({
    id: 'number.integer',
    name: 'string',
    member: 'number.integer',
    maxUsers: 'number.integer',
    game: 'number.integer',
    spawn: 'number.integer'
})

const Table = type({
    id: 'number.integer',
    roomId: 'number.integer',
    game: 'string'
})

const Waddle = type({
    id: 'number.integer',
    roomId: 'number.integer',
    seats: 'number.integer',
    game: 'string'
})

const Flooring = type({
    '[string]': FlooringItem
})

const Furniture = type({
    '[string]': FurnitureItem
})

const Items = type({
    '[string]': Item
})

const Pets = type({
    '[string]': Pet
})

const Igloos = type({
    '[string]': Igloo
})

const Rooms = Room.array()

const Matchmakers = type({
    '[string]': Matchmaker
})

const Tables = Table.array()

const Waddles = Waddle.array()

const Cards = type({
    '[string]': Card
})

const Decks = type({
    '[string]': 'number.integer[]'
})

export const flooring = Flooring.assert(loadJson('data/flooring'))
export const furniture = Furniture.assert(loadJson('data/furniture'))
export const items = Items.assert(loadJson('data/items'))
export const pets = Pets.assert(loadJson('data/pets'))

export const igloos = Igloos.assert(loadJson('data/igloos'))
export const rooms = Rooms.assert(loadJson('data/rooms'))

export const matchmakers = Matchmakers.assert(loadJson('data/matchmakers'))
export const tables = Tables.assert(loadJson('data/tables'))
export const waddles = Waddles.assert(loadJson('data/waddles'))

export const cards = Cards.assert(loadJson('data/cards'))
export const decks = Decks.assert(loadJson('data/decks'))
