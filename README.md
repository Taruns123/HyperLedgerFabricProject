# Chainify — land registry on Hyperledger Fabric

React front end for a permissioned land registry: parcels (survey number, GeoJSON boundary,
valuation, liens), ownership transfers, co-ownership share splits and an on-chain audit trail.
The Fabric gateway lives in [Backend-Chainify](https://github.com/Taruns123/Backend-Chainify).

## Run

```bash
npm install

# Demo mode — no Fabric network or backend needed (in-memory demo ledger), port 5301
npm run start:demo

# Live mode — talks to the Express gateway (default http://localhost:4000)
REACT_APP_API_URL=http://localhost:4000 npm start
```

`REACT_APP_DEMO=1` switches `src/api/index.js` to the demo data in `src/data/mockData.js`;
without it the app calls the original `/getQuery`, `/create/...` and `/changeOwner/...` endpoints.

## Screens

- `/` — product landing
- `/assets` — asset register with filters, KPIs and status chips
- `/assets/:id` — parcel map, ledger verification, owners, liens and ownership timeline
- `/assets/new` — sectioned registration form with live validation and GeoJSON preview
- `/transfer` — transfer flow with stamp duty / fee summary and endorsement policy
- `/co-ownership` — undivided share split editor
