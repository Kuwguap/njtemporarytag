/**
 * VIN decode via our backend (proxies to NHTSA - free, no key)
 */
const API_URL = import.meta.env.VITE_API_URL || ''

export interface VinDecodeResult {
  year: string
  make: string
  model: string
}

export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  const clean = String(vin || '').trim().toUpperCase()
  if (clean.length < 8) return null

  const res = await fetch(`${API_URL}/api/vin/decode?vin=${encodeURIComponent(clean)}`)
  if (!res.ok) return null

  const data = await res.json()
  const { year = '', make = '', model = '' } = data

  if (!year && !make) return null

  return { year: String(year).trim(), make: String(make).trim(), model: String(model).trim() }
}
