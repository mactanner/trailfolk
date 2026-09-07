import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './App.css'
import {
  difficultyOptions,
  hikeFilterInputSchema,
  regionOptions,
  type Difficulty,
  type HikeFilterInput,
  type SwissRegion,
} from './hikeFilterSchema'
import { hikes } from './hikes'

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

  const filteredHikes = useMemo(
    () => getFilteredHikes(minLength, maxLength, difficulty, minElevation, maxDuration, region),
    [difficulty, maxDuration, maxLength, minElevation, minLength, region],
  )

  useEffect(() => {
    filtersRef.current = { minLength, maxLength, difficulty, minElevation, maxDuration, region }
  }, [difficulty, maxDuration, maxLength, minElevation, minLength, region])

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
      await modelContext.registerTool<HikeFilterInput>(
        {
          name: 'filter_hikes',
          description:
          'Wende Filter auf die Schweizer Wanderauswahl an. Verwende minLength für "mindestens N km", maxLength für "höchstens N km", minElevation für "mindestens N Höhenmeter im Aufstieg", maxDuration für "höchstens N Minuten Gehzeit" und region für eine bestimmte Region. Nicht angegebene Filter behalten ihren aktuellen Wert. Gibt die passenden Wanderungen zurück.',
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

    void registerTools().catch((error: unknown) => {
      if (!controller.signal.aborted) {
        console.error('WebMCP tool registration failed.', error)
      }
    })

    return () => controller.abort()
  }, [])

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
        <nav aria-label="Hauptnavigation">
          <a href="#explore">Wanderungen entdecken</a>
          <a href="#about">Über die Auswahl</a>
        </nav>
        <button className="saved-button" type="button" aria-label="Gespeicherte Wanderungen">
          ♡ <span>Gespeichert</span>
        </button>
      </header>

      <main>
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

        <section className="explore-section" id="explore">
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
