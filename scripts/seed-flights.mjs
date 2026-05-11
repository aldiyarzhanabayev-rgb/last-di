import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyB2_EFbRgjCHOdcoo1MI5rSFEao54PrVxU',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'avia-trans.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'avia-trans',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'avia-trans.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '408511376473',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:408511376473:web:36dcc20d5cfb44c08a5548'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const origins = ['Almaty', 'Astana', 'Shymkent']
const destinations = ['Dubai', 'Frankfurt', 'Istanbul', 'Doha', 'Shanghai', 'Amsterdam']
const airlines = ['Turkish Cargo', 'Qatar Cargo', 'Lufthansa Cargo', 'Emirates SkyCargo', 'Cargolux', 'Air Astana Cargo']
const hubs = ['Istanbul', 'Doha', 'Frankfurt', 'Dubai', 'Baku', 'Amsterdam']
const aircraft = ['Boeing 777F', 'Boeing 747-8F', 'Airbus A330F', 'Boeing 767F', 'Airbus A321P2F']
const cargoSets = [
  ['general', 'fragile'],
  ['general', 'pharma'],
  ['general', 'valuable'],
  ['general', 'dangerous'],
  ['general', 'fragile', 'pharma'],
]

const flights = []
let index = 1
for (const origin of origins) {
  for (const destination of destinations) {
    for (let i = 0; i < 5; i++) {
      const airline = airlines[(index + i) % airlines.length]
      const id = `FLT-${String(index).padStart(3, '0')}`
      flights.push({
        id,
        airline,
        flightNo: `${airline.split(' ')[0].slice(0, 2).toUpperCase()}-${100 + index}`,
        origin,
        destination,
        hub: hubs[(index + i) % hubs.length],
        aircraft: aircraft[(index + i) % aircraft.length],
        maxWeightKg: 800 + ((index * 137) % 5200),
        maxVolumeM3: 8 + ((index * 7) % 44),
        pricePerKg: Number((2.6 + ((index * 0.37) % 5.4)).toFixed(2)),
        etaHours: 10 + ((index * 3) % 62),
        reliabilityScore: 72 + ((index * 5) % 27),
        allowedCargoTypes: cargoSets[index % cargoSets.length],
        departureWindow: ['Morning', 'Afternoon', 'Evening', 'Night'][index % 4]
      })
      index++
    }
  }
}

console.log(`Seeding ${flights.length} flights...`)
for (const flight of flights) {
  await setDoc(doc(db, 'flights', flight.id), flight)
}
console.log('Done. 90 test flights uploaded to Firestore collection: flights')
