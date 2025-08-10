// Cliente simples para o serviço de astrologia (Swiss Ephemeris via Flatlib)
// URL configurável via VITE_ASTRO_API_URL (ex.: http://localhost:8000)

export async function fetchNatalChart({
  dateISO, // string ISO local ex: 1992-09-28T21:10:00
  timezone, // ex.: 'America/Sao_Paulo'
  latitude,
  longitude,
}) {
  const baseUrl = import.meta.env.VITE_ASTRO_API_URL || 'http://localhost:3001';
  const url = `${baseUrl.replace(/\/$/, '')}/api/astrology/natal`;

  const body = {
    dateISO,
    timezone,
    latitude,
    longitude,
    houseSystem: 'placidus',
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Astro API error: ${res.status} - ${errText}`);
  }

  return res.json();
}

