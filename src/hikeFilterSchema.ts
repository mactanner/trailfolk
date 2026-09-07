export type Difficulty = 'Easy' | 'Moderate' | 'Difficult'
export type SwissRegion = 'Berner Oberland' | 'Zentralschweiz' | 'Ostschweiz' | 'Westschweiz' | 'Wallis' | 'Tessin' | 'Graubünden'

export type HikeFilterInput = {
  minLength?: number
  maxLength?: number
  difficulty?: 'All' | Difficulty
  minElevation?: number
  maxDuration?: number
  region?: 'All' | SwissRegion
}

export const difficultyOptions: Array<'All' | Difficulty> = [
  'All',
  'Easy',
  'Moderate',
  'Difficult',
]

export const regionOptions: Array<'All' | SwissRegion> = [
  'All',
  'Berner Oberland',
  'Zentralschweiz',
  'Ostschweiz',
  'Westschweiz',
  'Wallis',
  'Tessin',
  'Graubünden',
]

export const hikeFilterInputSchema = {
  type: 'object',
  properties: {
    minLength: {
      type: 'number',
      minimum: 3,
      maximum: 25,
      description: 'Minimale Weglänge in Kilometern. Verwende dies für "mindestens N km".',
    },
    maxLength: {
      type: 'number',
      minimum: 3,
      maximum: 25,
      description: 'Maximale Weglänge in Kilometern.',
    },
    difficulty: {
      type: 'string',
      enum: ['All', 'Easy', 'Moderate', 'Difficult'],
      description: 'Erforderlicher Schwierigkeitsgrad.',
    },
    minElevation: {
      type: 'number',
      minimum: 0,
      maximum: 1500,
      description: 'Mindestanzahl an Höhenmetern im Aufstieg.',
    },
    maxDuration: {
      type: 'number',
      minimum: 60,
      maximum: 600,
      description: 'Maximale Gehzeit in Minuten.',
    },
    region: {
      type: 'string',
      enum: regionOptions,
      description: 'Region in der Schweiz, in der die Wanderung liegt.',
    },
  },
} as const
