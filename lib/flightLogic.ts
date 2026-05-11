import type { CargoRequest, Flight } from './types'

export function filterSuitableFlights(request: CargoRequest, flights: Flight[]) {
  return flights
    .filter(f => f.origin.toLowerCase() === request.origin.toLowerCase())
    .filter(f => f.destination.toLowerCase() === request.destination.toLowerCase())
    .filter(f => f.maxWeightKg >= Number(request.weightKg || 0))
    .filter(f => f.maxVolumeM3 >= Number(request.volumeM3 || 0))
    .filter(f => f.allowedCargoTypes.includes(request.cargoType) || f.allowedCargoTypes.includes('general'))
    .map(f => ({
      ...f,
      totalPrice: Math.round(f.pricePerKg * Number(request.weightKg || 0)),
      calculatedScore: Math.round((f.reliabilityScore * 0.45) + ((100 - Math.min(f.etaHours, 100)) * 0.3) + ((100 - Math.min(f.pricePerKg * 10, 100)) * 0.25))
    }))
    .sort((a, b) => b.calculatedScore - a.calculatedScore)
}

export function fallbackRecommendation(request: CargoRequest, flights: Flight[]) {
  const suitable = filterSuitableFlights(request, flights)
  const list = suitable.length ? suitable : flights.slice(0, 10).map(f => ({ ...f, totalPrice: Math.round(f.pricePerKg * Number(request.weightKg || 0)), calculatedScore: f.reliabilityScore }))
  const fastest = [...list].sort((a, b) => a.etaHours - b.etaHours)[0]
  const cheapest = [...list].sort((a, b) => a.totalPrice - b.totalPrice)[0]
  const recommended = list[0]
  return {
    recommendedFlightId: recommended?.id || '',
    fastestFlightId: fastest?.id || '',
    cheapestFlightId: cheapest?.id || '',
    score: recommended?.calculatedScore || 80,
    explanation: 'Автоматическая рекомендация сформирована на основе соответствия маршруту, грузоподъёмности, стоимости, ETA и рейтинга надёжности авиаперевозчика.'
  }
}
