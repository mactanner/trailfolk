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

export type HikeRecommendationInput = HikeFilterInput & {
  limit?: number
  preference?: string
}

export type RecommendationSummaryInput = {
  explanations: Array<{
    name: string
    text: string
  }>
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

export const hikeRecommendationInputSchema = {
  type: 'object',
  properties: {
    ...hikeFilterInputSchema.properties,
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 3,
      description: 'Maximale Anzahl an Empfehlungen. Standardmäßig werden 3 Wanderungen zurückgegeben.',
    },
    preference: {
      type: 'string',
      maxLength: 240,
      description: 'Freier Wunsch für die Empfehlung, zum Beispiel "eine Tour mit einem krönenden Dessert danach".',
    },
  },
} as const

export const recommendationSummaryInputSchema = {
  type: 'object',
  properties: {
    explanations: {
      type: 'array',
      minItems: 1,
      maxItems: 3,
      description: 'Eine natürliche Begründung pro empfohlener Wanderung.',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Exakter Name einer Wanderung aus den Empfehlungen.',
          },
          text: {
            type: 'string',
            minLength: 1,
            maxLength: 2000,
            description: 'Prosa-Begründung und optionale Zusatzinformationen für diese Wanderung.',
          },
        },
        required: ['name', 'text'],
      },
    },
  },
  required: ['explanations'],
} as const
