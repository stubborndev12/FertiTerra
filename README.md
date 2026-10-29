# FertiTerra

![CI](https://github.com/stubborndev12/FertiTerra/actions/workflows/ci.yml/badge.svg)

A fertility care platform for Africa: education, at home testing, guided cycle tracking and access to clinicians. Built for the couples who are usually left out of the conversation.

![FertiTerra home](docs/screenshots/product-home.png)

Live: https://v0-fertility-telemedicine-platform.vercel.app

## Why this exists

Fertility care in Africa is expensive, urban, and quiet. Couples are told to keep trying, testing is far away and costly, and no one tracks anything. FertiTerra brings the first steps of fertility care into a phone: understand your cycle, test at home, talk to a clinician, and know what to do next.

## What is inside

- *Fertility tracking*: cycle logging, fertile window prediction and trends over time
- *At home test kits*: shop and checkout for kits, with order tracking
- *Consultations*: appointment booking and a video consultation path
- *Plans*: tiered care plans with what each one includes
- *Knowledge centre and blog*: fertility education written for the local context
- *Community*: peer space for questions people do not want to ask out loud
- *Employer offer*: fertility benefit page aimed at companies covering staff
- *Provider side*: admin console for consultations, orders and content
- *Supporting services*: email service, video call service, telemedicine integrations

## Stack

Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI primitives, Supabase clients for data and auth, server actions, deployed on Vercel

## Running it

The deployed build is a public demo. Accounts and session handling run on a seeded store (`lib/demo-store.ts`) so the patient journey works without a provisioned database. Data access in the product code goes through the Supabase clients in `lib/`; point the environment at a Supabase project to run it on live data.

```
cp .env.example .env.local
npm install
npm run dev
```

## Structure

`app/` routes (marketplace, plans, consultations, appointments, dashboard, admin, auth, knowledge centre)
`components/` UI and product sections, with a typed primitive set in `components/ui`
`lib/` Supabase clients, email service, video call and telemedicine integration, utilities, validation
`actions/` server actions for auth, fertility tracking and user management

## Status

Prototype built and deployed, with the core patient journey working end to end. Next: clinician onboarding, payment rails for plans, and mobile packaging.

## Author

Chijioke Ugorji Kalu, founder, FertiTerra Technologies, Kigali

---

*Proprietary. Copyright (c) 2026 Chijioke Ugorji Kalu. All rights reserved. Shared for review only.*
