export type CargoRequest = {
  id?: string
  clientName: string
  company: string
  phone: string
  email: string
  origin: string
  destination: string
  weightKg: number
  volumeM3: number
  cargoType: string
  urgency: 'fastest' | 'cheapest' | 'balanced'
  comment?: string
  status: 'new' | 'ai_analyzed' | 'approved'
  createdAt?: any
}

export type Flight = {
  id: string
  airline: string
  flightNo: string
  origin: string
  destination: string
  hub: string
  aircraft: string
  maxWeightKg: number
  maxVolumeM3: number
  pricePerKg: number
  etaHours: number
  reliabilityScore: number
  allowedCargoTypes: string[]
  departureWindow: string
}

export type AiRecommendation = {
  requestId: string
  recommendedFlightId: string
  fastestFlightId: string
  cheapestFlightId: string
  explanation: string
  score: number
  createdAt?: any
}
