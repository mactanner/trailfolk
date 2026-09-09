import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './App.css'
import {
  difficultyOptions,
  hikeFilterInputSchema,
  hikeRecommendationInputSchema,
  recommendationSummaryInputSchema,
  regionOptions,
  type Difficulty,
  type HikeFilterInput,
  type HikeRecommendationInput,
  type RecommendationSummaryInput,
  type SwissRegion,
} from './hikeFilterSchema'
import { hikes, type Hike } from './hikes'

type HikeRecommendation = {
  hike: Hike
  score: number
  reasons: string[]
}

type AppView = 'explore' | 'inspiration'

const isRegionOption = (value: string): value is 'All' | SwissRegion =>
  regionOptions.some((option) => option === value)

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${minutes} Min.`
  }
  if (remainingMinutes === 0) {
    return `${hours} Std.`
  }
  return `${hours} Std. ${remainingMinutes} Min.`
}

const formatDifficulty = (difficulty: Difficulty) =>
  difficulty === 'Easy' ? 'Einfach' : difficulty === 'Moderate' ? 'Mittel' : 'Schwierig'

const getFilteredHikes = (
  minLength: number,
  maxLength: number,
  difficulty: 'All' | Difficulty,
  minElevation: number,
  maxDuration: number,
  region: 'All' | SwissRegion,
) =>
  hikes.filter(
    (hike) =>
      hike.distance >= minLength &&
      hike.distance <= maxLength &&
      (difficulty === 'All' || hike.difficulty === difficulty) &&
      hike.elevation >= minElevation &&
      hike.duration <= maxDuration &&
      (region === 'All' || hike.area === region),
  )

const validateFilterInput = (input: HikeFilterInput): HikeFilterInput => {
  if (
    input.minLength !== undefined &&
    (!Number.isFinite(input.minLength) || input.minLength < 3 || input.minLength > 25)
  ) {
    throw new Error('minLength muss eine Zahl zwischen 3 und 25 sein.')
  }
  if (
    input.maxLength !== undefined &&
    (!Number.isFinite(input.maxLength) || input.maxLength < 3 || input.maxLength > 25)
  ) {
    throw new Error('maxLength muss eine Zahl zwischen 3 und 25 sein.')
  }
  if (
    input.minElevation !== undefined &&
    (!Number.isFinite(input.minElevation) || input.minElevation < 0 || input.minElevation > 1500)
  ) {
    throw new Error('minElevation muss eine Zahl zwischen 0 und 1500 sein.')
  }
  if (
    input.maxDuration !== undefined &&
    (!Number.isFinite(input.maxDuration) || input.maxDuration < 60 || input.maxDuration > 600)
  ) {
    throw new Error('maxDuration muss eine Zahl zwischen 60 und 600 Minuten sein.')
  }
  if (
    input.difficulty !== undefined &&
    !difficultyOptions.includes(input.difficulty)
  ) {
    throw new Error('difficulty muss All, Easy, Moderate oder Difficult sein.')
  }
  if (input.region !== undefined && !regionOptions.includes(input.region)) {
    throw new Error('region ist keine gültige Region der Schweiz.')
  }
  if (
    input.minLength !== undefined &&
    input.maxLength !== undefined &&
    input.minLength > input.maxLength
  ) {
    throw new Error('minLength darf nicht größer als maxLength sein.')
  }

  return input
}

const validateRecommendationInput = (input: HikeRecommendationInput): HikeRecommendationInput => {
  const { limit, preference, ...filters } = input
  validateFilterInput(filters)

  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 3)) {
    throw new Error('limit muss eine ganze Zahl zwischen 1 und 3 sein.')
  }
  if (preference !== undefined && (typeof preference !== 'string' || preference.trim().length === 0 || preference.length > 240)) {
    throw new Error('preference muss zwischen 1 und 240 Zeichen enthalten.')
  }

  return input
}

const validateRecommendationSummaryInput = (input: RecommendationSummaryInput): RecommendationSummaryInput => {
  if (!Array.isArray(input.explanations) || input.explanations.length < 1 || input.explanations.length > 3) {
    throw new Error('explanations muss zwischen 1 und 3 Einträge enthalten.')
  }

  for (const explanation of input.explanations) {
    if (typeof explanation.name !== 'string' || explanation.name.trim().length === 0) {
      throw new Error('Jede Erklärung benötigt einen Wanderungsnamen.')
    }
    if (typeof explanation.text !== 'string' || explanation.text.trim().length === 0) {
      throw new Error('Jede Erklärung benötigt einen Text.')
    }
    if (explanation.text.length > 2000) {
      throw new Error('Eine Erklärung darf höchstens 2000 Zeichen enthalten.')
    }
    if (!hikes.some((hike) => hike.name === explanation.name)) {
      throw new Error(`Die Wanderung "${explanation.name}" wurde nicht gefunden.`)
    }
  }

  return input
}

const getRecommendationScore = (hike: Hike, input: HikeRecommendationInput) => {
  let score = 0
  let weight = 0

  if (input.region !== undefined && input.region !== 'All') {
    weight += 3
    score += hike.area === input.region ? 3 : 0
  }
  if (input.difficulty !== undefined && input.difficulty !== 'All') {
    weight += 3
    score += hike.difficulty === input.difficulty ? 3 : 0
  }
  if (input.maxDuration !== undefined) {
    weight += 2
    score += 2 * Math.max(0, 1 - hike.duration / input.maxDuration)
  }
  if (input.minLength !== undefined) {
    weight += 1
    score += Math.min(1, hike.distance / input.minLength)
  }
  if (input.maxLength !== undefined) {
    weight += 1
    score += Math.max(0, 1 - hike.distance / input.maxLength)
  }
  if (input.minElevation !== undefined) {
    weight += 1
    score += Math.min(1, hike.elevation / Math.max(input.minElevation, 1))
  }

  if (weight === 0) {
    const durationFit = Math.max(0, 1 - Math.abs(hike.duration - 240) / 360)
    const distanceFit = Math.max(0, 1 - Math.abs(hike.distance - 10) / 20)
    return Math.round((durationFit * 0.6 + distanceFit * 0.4) * 100)
  }

  return Math.round((score / weight) * 100)
}

const getRecommendationReasons = (hike: Hike, input: HikeRecommendationInput) => {
  const reasons: string[] = []

  if (input.difficulty !== undefined && input.difficulty !== 'All') {
    reasons.push(`Schwierigkeit: ${formatDifficulty(hike.difficulty)}`)
  }
  if (input.region !== undefined && input.region !== 'All') {
    reasons.push(`Region: ${hike.region}`)
  }
  if (input.maxDuration !== undefined) {
    reasons.push(`Gehzeit bis ${formatDuration(input.maxDuration)}`)
  }
  if (input.minLength !== undefined || input.maxLength !== undefined) {
    const min = input.minLength ?? 3
    const max = input.maxLength ?? 25
    reasons.push(`Strecke: ${min.toLocaleString('de-DE')}–${max.toLocaleString('de-DE')} km`)
  }
  if (input.minElevation !== undefined) {
    reasons.push(`Aufstieg ab ${input.minElevation.toLocaleString('de-DE')} m`)
  }

  if (reasons.length === 0) {
    reasons.push(`${formatDifficulty(hike.difficulty)} · ${formatDuration(hike.duration)}`)
  }

  return reasons.slice(0, 3)
}

const getRecommendedHikes = (input: HikeRecommendationInput): HikeRecommendation[] => {
  const matchingHikes = getFilteredHikes(
    input.minLength ?? 3,
    input.maxLength ?? 25,
    input.difficulty ?? 'All',
    input.minElevation ?? 0,
    input.maxDuration ?? 600,
    input.region ?? 'All',
  )

  return matchingHikes
    .map((hike) => ({
      hike,
      score: getRecommendationScore(hike, input),
      reasons: getRecommendationReasons(hike, input),
    }))
    .sort((left, right) => right.score - left.score || left.hike.name.localeCompare(right.hike.name))
    .slice(0, input.limit ?? 3)
}

const RecommendationExplanation = ({ text }: { text: string }) => {
  const renderInlineMarkdown = (line: string) =>
    line.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>
      }
      return part
    })

  return (
    <>
      {text.split('\n').map((line, lineIndex) => {
        const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)$/)
        const content = bulletMatch ? bulletMatch[2] : line

        return (
          <Fragment key={`${line}-${lineIndex}`}>
            {lineIndex > 0 && <br />}
            {bulletMatch ? `${bulletMatch[1]}• ` : ''}
            {renderInlineMarkdown(content)}
          </Fragment>
        )
      })}
    </>
  )
}

const RecommendationResults = ({
  recommendations,
  explanations,
}: {
  recommendations: HikeRecommendation[]
  explanations: Record<string, string>
}) => {
  if (recommendations.length === 0) {
    return <p className="recommendation-empty">Keine Wanderung passt zu diesen Wünschen.</p>
  }

  return (
    <div className="recommendation-grid">
      {recommendations.map(({ hike, reasons }) => (
        <article className="recommendation-card" key={hike.name}>
          <div className="recommendation-image" style={{ background: hike.color }}>
            <span className="recommendation-emoji" aria-hidden="true">{hike.emoji}</span>
            <span className={`difficulty difficulty-${hike.difficulty.toLowerCase()}`}>{formatDifficulty(hike.difficulty)}</span>
          </div>
          <div className="recommendation-content">
            <p className="hike-region">{hike.region}</p>
            <h4>{hike.name}</h4>
            <div className="recommendation-meta">
              <span>{hike.distance.toLocaleString('de-DE')} km</span>
              <span>{formatDuration(hike.duration)}</span>
              <span>{hike.elevation.toLocaleString('de-DE')} m Aufstieg</span>
            </div>
            <p className="recommendation-reasons">{reasons.join(' · ')}</p>
            <p className={`recommendation-ai-text${explanations[hike.name] ? '' : ' is-pending'}`}>
              {explanations[hike.name] ? (
                <RecommendationExplanation text={explanations[hike.name]} />
              ) : (
                'Die AI ergänzt die Begründung für diese Tour.'
              )}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}

function App() {
  const [minLength, setMinLength] = useState(3)
  const [maxLength, setMaxLength] = useState(25)
  const [difficulty, setDifficulty] = useState<'All' | Difficulty>('All')
  const [minElevation, setMinElevation] = useState(0)
  const [maxDuration, setMaxDuration] = useState(600)
  const [region, setRegion] = useState<'All' | SwissRegion>('All')
  const filtersRef = useRef({
    minLength: 3,
    maxLength: 25,
    difficulty: 'All' as 'All' | Difficulty,
    minElevation: 0,
    maxDuration: 600,
    region: 'All' as 'All' | SwissRegion,
  })
  const initialRenderRef = useRef(true)
  const [filtersUpdated, setFiltersUpdated] = useState(false)
  const [recommendations, setRecommendations] = useState<HikeRecommendation[] | null>(null)
  const [recommendationExplanations, setRecommendationExplanations] = useState<Record<string, string>>({})
  const [activeView, setActiveView] = useState<AppView>('explore')

  const filteredHikes = useMemo(
    () => getFilteredHikes(minLength, maxLength, difficulty, minElevation, maxDuration, region),
    [difficulty, maxDuration, maxLength, minElevation, minLength, region],
  )

  useEffect(() => {
    filtersRef.current = { minLength, maxLength, difficulty, minElevation, maxDuration, region }
  }, [difficulty, maxDuration, maxLength, minElevation, minLength, region])

  const selectView = (view: AppView) => {
    setActiveView(view)
  }

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false
      return
    }
    setFiltersUpdated(true)
    const timeoutId = window.setTimeout(() => setFiltersUpdated(false), 700)
    return () => window.clearTimeout(timeoutId)
  }, [difficulty, maxDuration, maxLength, minElevation, minLength, region])

  useEffect(() => {
    const modelContext = document.modelContext
    if (!modelContext) {
      return
    }

    const controller = new AbortController()
    const registerTools = async () => {
      if (activeView === 'explore') {
        await modelContext.registerTool<HikeFilterInput>(
        {
          name: 'filter_hikes',
          description:
          'Ändere die sichtbaren Filter der Schweizer Wanderauswahl nur dann, wenn der Benutzer ausdrücklich Filter setzen oder die Ergebnisliste einschränken möchte. Verwende minLength für "mindestens N km", maxLength für "höchstens N km", minElevation für "mindestens N Höhenmeter im Aufstieg", maxDuration für "höchstens N Minuten Gehzeit" und region für eine bestimmte Region. Nicht angegebene Filter behalten ihren aktuellen Wert.',
          inputSchema: hikeFilterInputSchema,
          annotations: {
            readOnlyHint: false,
          },
          execute: async (input: HikeFilterInput) => {
            const requestedFilters = validateFilterInput(input)
            const nextFilters = {
              ...filtersRef.current,
              ...requestedFilters,
            }

            filtersRef.current = nextFilters
            setMaxLength(nextFilters.maxLength)
            setMinLength(nextFilters.minLength)
            setDifficulty(nextFilters.difficulty)
            setMinElevation(nextFilters.minElevation)
            setMaxDuration(nextFilters.maxDuration)
            setRegion(nextFilters.region)

            return {
              filters: nextFilters,
              count: getFilteredHikes(
                nextFilters.minLength,
                nextFilters.maxLength,
                nextFilters.difficulty,
                nextFilters.minElevation,
                nextFilters.maxDuration,
                nextFilters.region,
              ).length,
              hikes: getFilteredHikes(
                nextFilters.minLength,
                nextFilters.maxLength,
                nextFilters.difficulty,
                nextFilters.minElevation,
                nextFilters.maxDuration,
                nextFilters.region,
              ).map(({ name, region, distance, difficulty, altitude }) => ({
                name,
                region,
                distance,
                difficulty,
                altitude,
              })),
            }
          },
        },
        { signal: controller.signal },
      )
      }

      if (activeView === 'inspiration') {
        await modelContext.registerTool<HikeRecommendationInput>(
        {
          name: 'recommend_hikes',
          description:
            'Empfiehlt bis zu drei passende Wanderungen ausschließlich im Tab „Inspiration“. Verwende optionale Kriterien wie Schwierigkeit, Region, Weglänge, Höhenmeter und maximale Gehzeit. Übergebe qualitative oder freie Wünsche zusätzlich in preference, zum Beispiel "eine Tour mit einem krönenden Dessert danach". Verwende dieses Tool genau einmal pro Empfehlungsanfrage und nicht zusätzlich filter_hikes. Ändert die manuell gesetzten Filter nicht. Verwende anschließend genau einmal show_recommendation_summary mit einer Erklärung pro Empfehlung.',
          inputSchema: hikeRecommendationInputSchema,
          annotations: {
            readOnlyHint: false,
          },
          execute: async (input: HikeRecommendationInput) => {
            const requestedPreferences = validateRecommendationInput(input)
            const nextRecommendations = getRecommendedHikes(requestedPreferences)

            setRecommendations(nextRecommendations)
            setRecommendationExplanations({})

            return {
              preferences: requestedPreferences,
              count: nextRecommendations.length,
              recommendations: nextRecommendations.map(({ hike, score, reasons }) => ({
                name: hike.name,
                region: hike.region,
                distance: hike.distance,
                difficulty: hike.difficulty,
                duration: hike.duration,
                elevation: hike.elevation,
                score,
                reasons,
              })),
            }
          },
        },
        { signal: controller.signal },
      )

        await modelContext.registerTool<RecommendationSummaryInput>(
        {
          name: 'show_recommendation_summary',
          description:
            'Zeigt die von dir formulierte Prosa-Begründung direkt bei den zuvor empfohlenen Wanderungen im Tab „Inspiration“ an. Verwende dieses Tool nur im Tab „Inspiration“, nach recommend_hikes, und übergib für jede Empfehlung den exakten Namen sowie die passende Erklärung. Wechselt den Tab nicht automatisch.',
          inputSchema: recommendationSummaryInputSchema,
          annotations: {
            readOnlyHint: false,
          },
          execute: async (input: RecommendationSummaryInput) => {
            const validatedInput = validateRecommendationSummaryInput(input)
            setRecommendationExplanations(
              Object.fromEntries(
                validatedInput.explanations.map(({ name, text }) => [name, text.trim()]),
              ),
            )
            return {
              displayed: validatedInput.explanations.length,
            }
          },
        },
        { signal: controller.signal },
      )
      }

      if (activeView === 'explore') {
        await modelContext.registerTool<Record<string, never>>(
        {
          name: 'reset_hike_filters',
          description: 'Setzt die Filter der Schweizer Wanderauswahl zurück und zeigt alle Wanderungen.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
          annotations: {
            readOnlyHint: false,
          },
          execute: async () => {
            filtersRef.current = {
              minLength: 3,
              maxLength: 25,
              difficulty: 'All',
              minElevation: 0,
              maxDuration: 600,
              region: 'All',
            }
            setMinLength(3)
            setMaxLength(25)
            setDifficulty('All')
            setMinElevation(0)
            setMaxDuration(600)
            setRegion('All')
            return {
              filters: { minLength: 3, maxLength: 25, difficulty: 'All', minElevation: 0, maxDuration: 600, region: 'All' },
              count: hikes.length,
            }
          },
        },
        { signal: controller.signal },
      )
      }
    }

    void registerTools().catch((error: unknown) => {
      if (!controller.signal.aborted) {
        console.error('WebMCP tool registration failed.', error)
      }
    })

    return () => controller.abort()
  }, [activeView])

  const resetFilters = () => {
    setMinLength(3)
    setMaxLength(25)
    setDifficulty('All')
    setMinElevation(0)
    setMaxDuration(600)
    setRegion('All')
  }

  const hikeGridClassName = `hike-grid${filtersUpdated ? ' filters-updated' : ''}`
  const hasActiveFilters =
    minLength > 3 ||
    maxLength < 25 ||
    difficulty !== 'All' ||
    minElevation > 0 ||
    maxDuration < 600 ||
    region !== 'All'

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand" href="/">
          <span className="brand-mark">✦</span>
          <span>Trailfolk <em>Schweiz</em></span>
        </a>
        <nav className="view-tabs" aria-label="Hauptnavigation" role="tablist">
          <button
            id="explore-tab"
            className={`view-tab${activeView === 'explore' ? ' is-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeView === 'explore'}
            aria-controls="explore-panel"
            onClick={() => selectView('explore')}
          >
            Entdecken
          </button>
          <button
            id="inspiration-tab"
            className={`view-tab${activeView === 'inspiration' ? ' is-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeView === 'inspiration'}
            aria-controls="inspiration-panel"
            onClick={() => selectView('inspiration')}
          >
            Inspiration
            {recommendations && <span className="view-tab-badge">{recommendations.length}</span>}
          </button>
        </nav>
        <button className="saved-button" type="button" aria-label="Gespeicherte Wanderungen">
          ♡ <span>Gespeichert</span>
        </button>
      </header>

      <main>
        {activeView === 'explore' ? (
          <>
            <section className="hero" id="about">
          <div className="hero-copy">
            <p className="eyebrow">Ausgewählte Wanderungen aus der Schweiz</p>
            <h1>Finde deine nächste<br /><span>Berggeschichte.</span></h1>
            <p className="hero-intro">
              Fünfzig abwechslungsreiche Wanderungen durch die Schweiz – von stillen Wegen
              am See bis zu hochalpinen Abenteuern.
            </p>
            <a className="hero-link" href="#explore">Jetzt entdecken <span>↓</span></a>
          </div>
          <div className="hero-art" aria-label="Illustration der Schweizer Alpen" role="img">
            <div className="sun" />
            <div className="mountain mountain-back" />
            <div className="mountain mountain-front" />
            <div className="hero-lake" />
            <span className="hero-art-label">46°48′N · 9°32′E</span>
          </div>
            </section>

            <section className="explore-section" id="explore-panel" role="tabpanel" aria-labelledby="explore-tab">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Die Wanderauswahl</p>
              <h2>Finde dein nächstes Abenteuer</h2>
            </div>
            <p className={`result-count${filtersUpdated ? ' filters-updated' : ''}`} aria-live="polite"><strong>{filteredHikes.length}</strong> von {hikes.length} Wanderungen</p>
          </div>
          <div className="filter-summary" aria-live="polite" aria-label="Aktive Filter">
            <span className="filter-summary-label">Aktive Filter</span>
            <div className="filter-chips">
              {minLength > 3 && <span className="filter-chip">ab {minLength.toLocaleString('de-DE')} km</span>}
              {maxLength < 25 && <span className="filter-chip">bis {maxLength.toLocaleString('de-DE')} km</span>}
              {difficulty !== 'All' && <span className="filter-chip">{difficulty === 'Easy' ? 'Einfach' : difficulty === 'Moderate' ? 'Mittel' : 'Schwierig'}</span>}
              {minElevation > 0 && <span className="filter-chip">ab {minElevation.toLocaleString('de-DE')} m Aufstieg</span>}
              {maxDuration < 600 && <span className="filter-chip">bis {formatDuration(maxDuration)}</span>}
              {region !== 'All' && <span className="filter-chip">{region}</span>}
              {!hasActiveFilters && <span className="filter-chip filter-chip-muted">Keine Einschränkungen</span>}
            </div>
          </div>

          <div className="explore-layout">
            <aside className="filters" aria-label="Wanderungen filtern">
              <div className="filters-heading">
                <div>
                  <p className="filter-kicker">WebMCP-Demo</p>
                  <h3>Wanderungen filtern</h3>
                </div>
                <button type="button" onClick={resetFilters}>Zurücksetzen</button>
              </div>
              <p className="filters-intro">
                Passe die Auswahl manuell an oder steuere die Filter direkt über WebMCP.
              </p>

              <label className="filter-label" htmlFor="region">
                <span>Region in der Schweiz</span>
              </label>
              <select
                id="region"
                value={region}
                onChange={(event) => {
                  if (isRegionOption(event.target.value)) {
                    setRegion(event.target.value)
                  }
                }}
              >
                {regionOptions.map((option) => (
                  <option key={option} value={option}>{option === 'All' ? 'Alle Regionen' : option}</option>
                ))}
              </select>

              <label className="filter-label" htmlFor="difficulty">
                <span>Schwierigkeit</span>
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as 'All' | Difficulty)}
              >
                {difficultyOptions.map((option) => (
                  <option key={option} value={option}>{option === 'All' ? 'Alle Stufen' : option === 'Easy' ? 'Einfach' : option === 'Moderate' ? 'Mittel' : 'Schwierig'}</option>
                ))}
              </select>

              <label className="filter-label" htmlFor="duration">
                <span>Wanderdauer bis</span>
                <strong>{maxDuration === 600 ? 'Beliebig' : formatDuration(maxDuration)}</strong>
              </label>
              <input
                id="duration"
                type="range"
                min="60"
                max="600"
                step="30"
                value={maxDuration}
                onChange={(event) => setMaxDuration(Number(event.target.value))}
              />
              <div className="range-ends"><span>1 Std.</span><span>10 Std.</span></div>

              <label className="filter-label" htmlFor="min-length">
                <span>Strecke ab</span>
                <strong>{minLength.toLocaleString('de-DE')} km</strong>
              </label>
              <input
                id="min-length"
                type="range"
                min="3"
                max="25"
                step="1"
                value={minLength}
                onChange={(event) => setMinLength(Math.min(Number(event.target.value), maxLength))}
              />
              <div className="range-ends"><span>3 km</span><span>25 km</span></div>

              <label className="filter-label" htmlFor="max-length">
                <span>Strecke bis</span>
                <strong>{maxLength.toLocaleString('de-DE')} km</strong>
              </label>
              <input
                id="max-length"
                type="range"
                min="3"
                max="25"
                step="1"
                value={maxLength}
                onChange={(event) => setMaxLength(Math.max(Number(event.target.value), minLength))}
              />
              <div className="range-ends"><span>{minLength} km</span><span>25 km</span></div>

              <label className="filter-label" htmlFor="elevation">
                <span>Mindest-Höhenmeter</span>
                <strong>{minElevation === 0 ? 'Beliebig' : `${minElevation.toLocaleString('de-DE')} m Aufstieg`}</strong>
              </label>
              <input
                id="elevation"
                type="range"
                min="0"
                max="1500"
                step="50"
                value={minElevation}
                onChange={(event) => setMinElevation(Number(event.target.value))}
              />
              <div className="range-ends"><span>Beliebig</span><span>1.500 m</span></div>

              <div className="filter-note">
                <span>✦</span>
                <p>Jede Wanderung wurde wegen ihrer Aussicht, ihres Charakters und einer guten Geschichte ausgewählt.</p>
              </div>
            </aside>

            <div className={hikeGridClassName}>
              {filteredHikes.length > 0 ? (
                filteredHikes.map((hike) => (
                  <article className="hike-card" key={hike.name}>
                    <div className="hike-image" style={{ '--card-color': hike.color } as CSSProperties}>
                      <span className="hike-emoji" aria-hidden="true">{hike.emoji}</span>
                      <span className={`difficulty difficulty-${hike.difficulty.toLowerCase()}`}>{hike.difficulty === 'Easy' ? 'Einfach' : hike.difficulty === 'Moderate' ? 'Mittel' : 'Schwierig'}</span>
                      <button className="favorite" type="button" aria-label={`${hike.name} speichern`}>♡</button>
                      <span className="altitude-stamp">{hike.altitude.toLocaleString('de-DE')} m</span>
                    </div>
                    <div className="hike-content">
                      <p className="hike-region">{hike.region}</p>
                      <h3>{hike.name}</h3>
                      <div className="hike-meta">
                        <span><b>↔</b> {hike.distance.toLocaleString('de-DE')} km</span>
                        <span><b>↗</b> {hike.elevation.toLocaleString('de-DE')} m Aufstieg</span>
                        <span><b>◷</b> {hike.time}</span>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <span>◌</span>
                  <h3>Keine Wanderungen passen zu diesen Filtern.</h3>
                  <p>Erweitere deine Suche und finde eine neue Berggeschichte.</p>
                  <button type="button" onClick={resetFilters}>Alle Wanderungen anzeigen</button>
                </div>
              )}
            </div>
          </div>
        </section>
          </>
        ) : (
          <section className="inspiration-section" id="inspiration-panel" role="tabpanel" aria-labelledby="inspiration-tab">
            <div className="inspiration-heading">
              <div>
                <p className="eyebrow">WebMCP-Demo</p>
                <h1>Inspiration für deine nächste Tour.</h1>
                <p className="inspiration-intro">
                  Lass dir von einem AI-Tool Wanderungen empfehlen, die zu deinen
                  Wünschen passen. Die Empfehlungen erscheinen hier, ohne deine
                  manuellen Filter zu verändern.
                </p>
              </div>
              {recommendations && (
                <button
                  className="inspiration-clear"
                  type="button"
                  onClick={() => {
                    setRecommendations(null)
                    setRecommendationExplanations({})
                  }}
                >
                  Empfehlungen löschen
                </button>
              )}
            </div>

            {recommendations ? (
              <>
                <RecommendationResults
                  recommendations={recommendations}
                  explanations={recommendationExplanations}
                />
              </>
            ) : (
              <div className="inspiration-empty">
                <span aria-hidden="true">✦</span>
                <h2>Bereit für etwas Inspiration?</h2>
                <p>
                  Bitte ein AI-Tool zum Beispiel um eine einfache Wanderung im Wallis
                  oder eine Tour mit maximal drei Stunden Gehzeit.
                </p>
                <div className="inspiration-examples" aria-label="Beispielanfragen">
                  <span>„Etwas Einfaches im Wallis“</span>
                  <span>„Maximal 3 Stunden“</span>
                  <span>„Viel Aufstieg und eine schöne Aussicht“</span>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer>
        <span>TRAILFOLK / SCHWEIZ</span>
        <span>Für ruhige Morgen &amp; hohe Gipfel</span>
        <span>2024—2025</span>
      </footer>
    </div>
  )
}

export default App
