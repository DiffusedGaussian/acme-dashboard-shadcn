# ACME Logistics — Carrier Sales Dashboard

A real-time dashboard for monitoring automated inbound carrier calls powered by HappyRobot Voice AI.

## Overview

This dashboard provides visibility into the automated carrier sales process:

- **FMCSA Verification**: Carriers are verified using their MC number
- **Load Matching**: AI matches carriers to available loads
- **Price Negotiation**: Automated negotiation with up to 3 back-and-forth rounds
- **Call Classification**: Outcomes and sentiment are automatically classified
- **Transfer Handling**: Successfully negotiated calls are transferred to sales reps

## Features

- 📊 **KPI Metrics**: Total calls, conversion rate, revenue, discounts
- 📈 **Analytics Charts**: Outcome distribution, sentiment analysis
- 📋 **Call History**: Detailed log of all inbound carrier calls
- 🔄 **Real-time Updates**: Auto-refresh every 30 seconds
- 🎨 **ACME Branding**: Custom green color scheme

## Project Structure

```
src/
├── assets/           # Logo and static assets
├── components/       # React components
│   └── index.tsx     # All dashboard components
├── hooks/            # Custom React hooks
│   └── index.ts      # API fetching hooks
├── styles/           # CSS stylesheets
│   ├── tokens.css    # Design tokens (colors, spacing, etc.)
│   ├── base.css      # Component styles
│   └── index.css     # Style entry point
├── types/            # TypeScript type definitions
│   └── index.ts      # All type definitions
├── utils/            # Utility functions
│   └── index.ts      # Formatters, helpers
├── App.tsx           # Main application component
└── main.tsx          # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running at `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### API Configuration

The dashboard expects a backend API with the following endpoints:

- `GET /api/v1/dashboard` — Returns dashboard metrics and recent calls
- `POST /api/v1/demo/generate-calls` — Generates demo call data

## Design System

The dashboard uses a custom design system based on ACME's brand:

### Brand Colors

- **ACME Green**: `#00C853` (primary accent)
- **ACME Green Dark**: `#00A544` (hover states)
- **ACME Green Light**: `#E8F5E9` (backgrounds)

### Typography

- **Sans-serif**: Inter (400–800)
- **Monospace**: IBM Plex Mono (400–600)

### Spacing Scale

Based on 4px increments: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

## License

MIT — Built for ACME Logistics
