import * as Astronomy from 'astronomy-engine'

function zodiacSign(deg) {
  const signs = [
    'Áries',
    'Touro',
    'Gêmeos',
    'Câncer',
    'Leão',
    'Virgem',
    'Libra',
    'Escorpião',
    'Sagitário',
    'Capricórnio',
    'Aquário',
    'Peixes'
  ]
  return signs[Math.floor(((deg % 360) + 360) % 360 / 30)]
}

function computeAscendant(date, lat, lon) {
  const rad = Math.PI / 180;
  const obliquity = 23.4393 * rad;
  let lst = (Astronomy.SiderealTime(date) * 15 + lon) % 360;
  if (lst < 0) lst += 360;
  const lstRad = lst * rad;
  const latRad = lat * rad;
  const ascRad = Math.atan2(
    -Math.cos(lstRad),
    Math.sin(lstRad) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity)
  );
  let ascDeg = (ascRad / rad) % 360;
  if (ascDeg < 0) ascDeg += 360;
  return ascDeg;
}

export function houseNumber(lonDeg, ascDeg) {
  const diff = ((lonDeg - ascDeg) % 360 + 360) % 360
  return Math.floor(diff / 30) + 1
}

export function computeBirthChart(isoDate, lat, lon) {
  const date = new Date(isoDate)
  const bodies = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto'
  ]
  const positions = {}
  for (const name of bodies) {
    const vector = Astronomy.GeoVector(Astronomy.Body[name], date, true)
    const ecl = Astronomy.Ecliptic(vector)
    const lonDeg = ((ecl.elon % 360) + 360) % 360
    positions[name] = { longitude: lonDeg, sign: zodiacSign(lonDeg) }
  }
  const asc = computeAscendant(date, lat, lon)
  const houses = []
  for (let i = 0; i < 12; i++) {
    houses.push((asc + i * 30) % 360)
  }
  for (const name of bodies) {
    positions[name].house = houseNumber(positions[name].longitude, asc)
  }
  return { positions, ascendant: { degree: asc, sign: zodiacSign(asc) }, houses }
}
