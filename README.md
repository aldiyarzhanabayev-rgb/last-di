# Air Freight Firebase AI

Next.js + Firebase Firestore + OpenAI API MVP for air cargo workflow.

## Logic

- Client opens `/client` and submits cargo request.
- Client does not see route options.
- Request is saved to Firestore collection `requests`.
- API `/api/analyze` reads request + 90 flights from Firestore collection `flights`.
- OpenAI selects `recommended`, `fastest`, `cheapest` route. If OpenAI key is missing, fallback algorithm works.
- Logist opens `/logist`, sees AI recommendation and approves recommended or another flight.

## Firebase collections

- `flights` — 90 test flights
- `requests` — client requests
- `quotes` — AI recommendations and approved flight

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

3. Add your OpenAI API key:

```env
OPENAI_API_KEY=sk-...
```

4. Firestore rules for MVP:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /requests/{document=**} { allow read, write: if true; }
    match /flights/{document=**} { allow read, write: if true; }
    match /quotes/{document=**} { allow read, write: if true; }
  }
}
```

5. Upload 90 test flights:

```bash
npm run seed
```

6. Run locally:

```bash
npm run dev
```

7. Deploy to Vercel:

- Push to GitHub
- Import repo in Vercel
- Add environment variables from `.env.local`
- Deploy

## Pages

- `/` home
- `/client` client request form
- `/logist` logist dashboard
