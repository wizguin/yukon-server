import { loadJson } from '@utils/loadJson'

import { type } from 'arktype'

const Card = type({
    name: 'string | number',
    setId: 'number',
    powerId: 'number',
    element: 'string',
    color: 'string',
    value: 'number'
})

const FlooringItem = type({
    name: 'string',
    cost: 'number',
    patched: 'number'
})

const FurnitureItem = type({
    name: 'string',
    type: 'number',
    sort: 'number',
    cost: 'number',
    member: 'number',
    bait: 'number',
    patched: 'number',
    max: 'number'
})

const Igloo = type({
    name: 'string',
    cost: 'number',
    patched: 'number'
})

const Item = type({
    name: 'string',
    type: 'number',
    cost: 'number',
    member: 'number',
    bait: 'number',
    patched: 'number',
    treasure: 'number'
})

const Matchmaker = type({
    game: 'string'
})

const Pet = type({
    name: 'string',
    cost: 'number',
    member: 'number',
    ranPostcard: 'number'
})

const Room = type({
    id: 'number',
    name: 'string',
    member: 'number',
    maxUsers: 'number',
    game: 'number',
    spawn: 'number'
})

const Table = type({
    id: 'number',
    roomId: 'number',
    game: 'string'
})

const Waddle = type({
    id: 'number',
    roomId: 'number',
    seats: 'number',
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
    '[string]': 'number[]'
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
