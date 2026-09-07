import type { Difficulty, SwissRegion } from './hikeFilterSchema'

export type Hike = {
  name: string
  region: string
  area: SwissRegion
  distance: number
  difficulty: Difficulty
  altitude: number
  elevation: number
  time: string
  duration: number
  color: string
  emoji: string
}

export const hikes: Hike[] = [
  { name: 'Panoramaweg Oeschinensee', region: 'Berner Oberland', area: 'Berner Oberland', distance: 8.5, difficulty: 'Moderate', altitude: 2030, elevation: 420, time: '3 Std. 15 Min.', duration: 195, color: '#2d6a5b', emoji: '🏔️' },
  { name: 'Fünf-Seen-Weg', region: 'Zermatt', area: 'Wallis', distance: 9.3, difficulty: 'Moderate', altitude: 2571, elevation: 310, time: '3 Std. 30 Min.', duration: 210, color: '#315c83', emoji: '🏞️' },
  { name: 'Gratwanderung Stoos', region: 'Zentralschweiz', area: 'Zentralschweiz', distance: 4.7, difficulty: 'Difficult', altitude: 1935, elevation: 420, time: '2 Std. 30 Min.', duration: 150, color: '#9b633f', emoji: '⛰️' },
  { name: 'Halbmond von Creux du Van', region: 'Neuenburger Jura', area: 'Westschweiz', distance: 13.2, difficulty: 'Moderate', altitude: 1463, elevation: 540, time: '4 Std. 45 Min.', duration: 285, color: '#6a7150', emoji: '🌄' },
  { name: 'Rigi-Ufer-Rundweg', region: 'Vierwaldstättersee', area: 'Zentralschweiz', distance: 6.1, difficulty: 'Easy', altitude: 1435, elevation: 180, time: '2 Std.', duration: 120, color: '#4c7890', emoji: '🌿' },
  { name: 'Aletschgletscher-Aussichtspunkt', region: 'Walliser Alpen', area: 'Wallis', distance: 11.8, difficulty: 'Moderate', altitude: 2330, elevation: 510, time: '4 Std.', duration: 240, color: '#56778a', emoji: '❄️' },
  { name: 'Hardergrat-Gipfelroute', region: 'Interlaken', area: 'Berner Oberland', distance: 15.6, difficulty: 'Difficult', altitude: 1800, elevation: 1070, time: '6 Std. 30 Min.', duration: 390, color: '#765844', emoji: '🌲' },
  { name: 'Rebweg Lavaux', region: 'Genfersee', area: 'Westschweiz', distance: 7.4, difficulty: 'Easy', altitude: 680, elevation: 220, time: '2 Std. 15 Min.', duration: 135, color: '#98724d', emoji: '🍇' },
  { name: 'Pizol-Fünf-Seen-Wanderung', region: 'St. Gallen', area: 'Ostschweiz', distance: 10.8, difficulty: 'Difficult', altitude: 2844, elevation: 610, time: '5 Std.', duration: 300, color: '#596c75', emoji: '💧' },
  { name: 'Alpwiesenweg am Säntis', region: 'Appenzell', area: 'Ostschweiz', distance: 5.2, difficulty: 'Moderate', altitude: 2212, elevation: 360, time: '2 Std. 45 Min.', duration: 165, color: '#52705e', emoji: '🌱' },
  { name: 'Talweg Lauterbrunnen', region: 'Berner Oberland', area: 'Berner Oberland', distance: 8.1, difficulty: 'Easy', altitude: 900, elevation: 120, time: '2 Std. 30 Min.', duration: 150, color: '#4e765f', emoji: '💦' },
  { name: 'Gornergrat-Höhenweg', region: 'Zermatt', area: 'Wallis', distance: 12.4, difficulty: 'Moderate', altitude: 3089, elevation: 280, time: '4 Std. 30 Min.', duration: 270, color: '#526b88', emoji: '🗻' },
  { name: 'Kastanienweg im Tessin', region: 'Tessin', area: 'Tessin', distance: 6.8, difficulty: 'Easy', altitude: 780, elevation: 260, time: '2 Std. 20 Min.', duration: 140, color: '#806247', emoji: '🍂' },
  { name: 'Via Alpina: Kandersteg', region: 'Berner Alpen', area: 'Berner Oberland', distance: 18.3, difficulty: 'Difficult', altitude: 2690, elevation: 980, time: '7 Std.', duration: 420, color: '#496976', emoji: '🥾' },
  { name: 'Jurahöhenweg zum Chasseral', region: 'Berner Jura', area: 'Westschweiz', distance: 14.5, difficulty: 'Moderate', altitude: 1607, elevation: 570, time: '5 Std.', duration: 300, color: '#6c735a', emoji: '🌤️' },
  { name: 'Kastanienwald von Soglio', region: 'Graubünden', area: 'Graubünden', distance: 4.2, difficulty: 'Easy', altitude: 1090, elevation: 150, time: '1 Std. 45 Min.', duration: 105, color: '#735f4d', emoji: '🌳' },
  { name: 'Zustieg zum Piz Bernina', region: 'Engadin', area: 'Graubünden', distance: 22.1, difficulty: 'Difficult', altitude: 2978, elevation: 1320, time: '8 Std. 30 Min.', duration: 510, color: '#586c80', emoji: '🏔️' },
  { name: 'Männlichen bis Kleine Scheidegg', region: 'Jungfrauregion', area: 'Berner Oberland', distance: 6.7, difficulty: 'Easy', altitude: 2343, elevation: 90, time: '2 Std.', duration: 120, color: '#647c69', emoji: '🚠' },
  { name: 'Wald-Rundweg Blausee', region: 'Kandertal', area: 'Berner Oberland', distance: 3.6, difficulty: 'Easy', altitude: 887, elevation: 70, time: '1 Std. 15 Min.', duration: 75, color: '#3f7180', emoji: '💙' },
  { name: 'Gratweg Monte San Salvatore', region: 'Lugano', area: 'Tessin', distance: 9.7, difficulty: 'Moderate', altitude: 912, elevation: 710, time: '3 Std. 45 Min.', duration: 225, color: '#8a674b', emoji: '🌅' },
  { name: 'First–Bachalpsee Panoramaweg', region: 'Grindelwald', area: 'Berner Oberland', distance: 6.2, difficulty: 'Moderate', altitude: 2265, elevation: 350, time: '2 Std. 30 Min.', duration: 150, color: '#3d756a', emoji: '🏔️' },
  { name: 'Gemmipass-Höhenweg', region: 'Leukerbad', area: 'Wallis', distance: 8.8, difficulty: 'Difficult', altitude: 2346, elevation: 620, time: '4 Std.', duration: 240, color: '#806b5a', emoji: '🪨' },
  { name: 'Raten–Gottschalkenberg', region: 'Zugerland', area: 'Zentralschweiz', distance: 10.1, difficulty: 'Easy', altitude: 1150, elevation: 280, time: '3 Std. 15 Min.', duration: 195, color: '#66816c', emoji: '🌲' },
  { name: 'Churfirsten-Walenseeweg', region: 'Walensee', area: 'Ostschweiz', distance: 12.6, difficulty: 'Difficult', altitude: 1800, elevation: 900, time: '6 Std.', duration: 360, color: '#506a78', emoji: '⛰️' },
  { name: 'Creux du Van zur Areuse', region: 'Neuenburger Jura', area: 'Westschweiz', distance: 14.8, difficulty: 'Difficult', altitude: 1380, elevation: 720, time: '5 Std. 30 Min.', duration: 330, color: '#67755c', emoji: '🌄' },
  { name: 'Verzascatal-Weg', region: 'Valle Verzasca', area: 'Tessin', distance: 11.4, difficulty: 'Moderate', altitude: 850, elevation: 460, time: '4 Std. 15 Min.', duration: 255, color: '#4e7772', emoji: '💧' },
  { name: 'Albula-Panoramaweg', region: 'Albula', area: 'Graubünden', distance: 13.7, difficulty: 'Moderate', altitude: 2500, elevation: 520, time: '5 Std.', duration: 300, color: '#63727d', emoji: '🏞️' },
  { name: 'Arosa–Marän Waldweg', region: 'Arosa', area: 'Graubünden', distance: 7.9, difficulty: 'Easy', altitude: 1880, elevation: 300, time: '3 Std.', duration: 180, color: '#6d806c', emoji: '🌲' },
  { name: 'Bürgenstock-Felsenweg', region: 'Vierwaldstättersee', area: 'Zentralschweiz', distance: 5.4, difficulty: 'Easy', altitude: 1127, elevation: 210, time: '2 Std. 15 Min.', duration: 135, color: '#557d82', emoji: '🌊' },
  { name: 'Gamplüt–Wildhaus Höhenweg', region: 'Toggenburg', area: 'Ostschweiz', distance: 9.2, difficulty: 'Moderate', altitude: 1770, elevation: 480, time: '4 Std.', duration: 240, color: '#6a785d', emoji: '🌱' },
  { name: 'Mürren–Gimmelwald Panoramaweg', region: 'Lauterbrunnental', area: 'Berner Oberland', distance: 6.5, difficulty: 'Easy', altitude: 1650, elevation: 260, time: '2 Std. 30 Min.', duration: 150, color: '#567d77', emoji: '🚠' },
  { name: 'Blüemlisalp-Panoramaweg', region: 'Kandersteg', area: 'Berner Oberland', distance: 14.2, difficulty: 'Difficult', altitude: 2840, elevation: 800, time: '6 Std.', duration: 360, color: '#596e7c', emoji: '🏔️' },
  { name: 'Furka-Gletscherweg', region: 'Furka', area: 'Wallis', distance: 9.8, difficulty: 'Moderate', altitude: 2430, elevation: 500, time: '4 Std. 30 Min.', duration: 270, color: '#6c8290', emoji: '❄️' },
  { name: 'Zinaler Gletscherblick', region: 'Zinal', area: 'Wallis', distance: 12.1, difficulty: 'Difficult', altitude: 2600, elevation: 850, time: '5 Std. 30 Min.', duration: 330, color: '#687b86', emoji: '🗻' },
  { name: 'Rigi Kaltbad–Scheidegg', region: 'Rigi', area: 'Zentralschweiz', distance: 9.8, difficulty: 'Moderate', altitude: 1650, elevation: 510, time: '4 Std. 30 Min.', duration: 270, color: '#66806d', emoji: '🌤️' },
  { name: 'Sarnersee-Uferweg', region: 'Sarnen', area: 'Zentralschweiz', distance: 11.6, difficulty: 'Easy', altitude: 500, elevation: 140, time: '3 Std. 30 Min.', duration: 210, color: '#4f7980', emoji: '🌊' },
  { name: 'Seealpsee-Rundweg', region: 'Appenzell', area: 'Ostschweiz', distance: 6.0, difficulty: 'Easy', altitude: 1143, elevation: 250, time: '2 Std. 30 Min.', duration: 150, color: '#587767', emoji: '💧' },
  { name: 'Toggenburger Klangweg', region: 'Toggenburg', area: 'Ostschweiz', distance: 7.0, difficulty: 'Easy', altitude: 1100, elevation: 180, time: '2 Std. 45 Min.', duration: 165, color: '#7b7959', emoji: '🎵' },
  { name: 'Walensee–Quinten Weg', region: 'Walensee', area: 'Ostschweiz', distance: 11.0, difficulty: 'Moderate', altitude: 650, elevation: 450, time: '4 Std. 30 Min.', duration: 270, color: '#47747b', emoji: '⛵' },
  { name: 'Jurahöhenweg Weissenstein', region: 'Solothurner Jura', area: 'Westschweiz', distance: 10.5, difficulty: 'Moderate', altitude: 1284, elevation: 490, time: '4 Std. 15 Min.', duration: 255, color: '#75775c', emoji: '🌤️' },
  { name: 'Mont-Tendre-Gipfelweg', region: 'Waadtländer Jura', area: 'Westschweiz', distance: 14.0, difficulty: 'Moderate', altitude: 1679, elevation: 560, time: '5 Std.', duration: 300, color: '#68745f', emoji: '🌾' },
  { name: 'Rochers-de-Naye Panoramaweg', region: 'Montreux', area: 'Westschweiz', distance: 8.6, difficulty: 'Moderate', altitude: 2042, elevation: 650, time: '4 Std. 30 Min.', duration: 270, color: '#806d60', emoji: '🌅' },
  { name: 'Cardada–Cimetta Höhenweg', region: 'Locarno', area: 'Tessin', distance: 8.3, difficulty: 'Moderate', altitude: 1671, elevation: 540, time: '4 Std.', duration: 240, color: '#6b805f', emoji: '🌴' },
  { name: 'Monte Brè–Gandria', region: 'Lugano', area: 'Tessin', distance: 7.4, difficulty: 'Moderate', altitude: 925, elevation: 390, time: '3 Std. 30 Min.', duration: 210, color: '#80684d', emoji: '🌿' },
  { name: 'Val-Müstair-Panoramaweg', region: 'Val Müstair', area: 'Graubünden', distance: 12.9, difficulty: 'Easy', altitude: 1800, elevation: 350, time: '4 Std. 30 Min.', duration: 270, color: '#718061', emoji: '🌼' },
  { name: 'Berninapass-Seenweg', region: 'Berninapass', area: 'Graubünden', distance: 10.3, difficulty: 'Moderate', altitude: 2300, elevation: 610, time: '4 Std. 45 Min.', duration: 285, color: '#637888', emoji: '🏔️' },
  { name: 'Flims–Caumasee-Weg', region: 'Flims', area: 'Graubünden', distance: 8.0, difficulty: 'Easy', altitude: 1100, elevation: 220, time: '3 Std.', duration: 180, color: '#4d7776', emoji: '💙' },
  { name: 'Val-Trupchun-Wildnisweg', region: 'Nationalpark', area: 'Graubünden', distance: 15.2, difficulty: 'Difficult', altitude: 2050, elevation: 720, time: '6 Std.', duration: 360, color: '#5e7362', emoji: '🦌' },
  { name: 'Torrent-Weg Leukerbad', region: 'Leukerbad', area: 'Wallis', distance: 5.8, difficulty: 'Easy', altitude: 1650, elevation: 240, time: '2 Std. 15 Min.', duration: 135, color: '#6d7d73', emoji: '🌲' },
  { name: 'Saas-Fee Alpwiesenweg', region: 'Saas-Fee', area: 'Wallis', distance: 8.9, difficulty: 'Moderate', altitude: 2200, elevation: 480, time: '4 Std.', duration: 240, color: '#71858b', emoji: '🏞️' },
]
