import { loadJson } from '../utils/loadJson'

import type { Assert } from 'ts-runtime-checks'

interface Card {
    name: string | number
    setId: number
    powerId: number
    element: string
    color: string
    value: number
}

interface FlooringItem {
    name: string
    cost: number
    patched: number
}

interface FurnitureItem {
    name: string
    type: number
    sort: number
    cost: number
    member: number
    bait: number
    patched: number
    max: number
}

interface Igloo {
    name: string
    cost: number
    patched: number
}

interface Item {
    name: string
    type: number
    cost: number
    member: number
    bait: number
    patched: number
    treasure: number
}

interface Matchmaker {
    game: string
}

interface Pet {
    name: string
    cost: number
    member: number
    ranPostcard: number
}

interface Room {
    id: number
    name: string
    member: number
    maxUsers: number
    game: number
    spawn: number
}

interface Table {
    id: number
    roomId: number
    game: string
}

interface Waddle {
    id: number
    roomId: number
    seats: number
    game: string
}

type Flooring = Record<string, FlooringItem>
type Furniture = Record<string, FurnitureItem>
type Items = Record<string, Item>
type Pets = Record<string, Pet>

type Igloos = Record<string, Igloo>
type Rooms = Room[]

type Matchmakers = Record<string, Matchmaker>
type Tables = Table[]
type Waddles = Waddle[]

type Cards = Record<string, Card>
type Decks = Record<string, number[]>

export const flooring = loadJson('data/flooring') as Assert<Flooring>
export const furniture = loadJson('data/furniture') as Assert<Furniture>
export const items = loadJson('data/items') as Assert<Items>
export const pets = loadJson('data/pets') as Assert<Pets>

export const igloos = loadJson('data/igloos') as Assert<Igloos>
export const rooms = loadJson('data/rooms') as Assert<Rooms>

export const matchmakers = loadJson('data/matchmakers') as Assert<Matchmakers>
export const tables = loadJson('data/tables') as Assert<Tables>
export const waddles = loadJson('data/waddles') as Assert<Waddles>

export const cards = loadJson('data/cards') as Assert<Cards>
export const decks = loadJson('data/decks') as Assert<Decks>
