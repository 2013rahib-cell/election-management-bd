# Election Management System — Bangladesh

A comprehensive, fully functional prototype of an **Election Management System** modeled after the Bangladesh Election Commission. Built as a single-page application with role-based access control, complete election workflow, and persistent local storage.

## Live Demo

[Deploy on Vercel](https://vercel.com/new) and connect this repository for instant deployment.

## Features

### Complete Election Workflow
1. **Voter Search** — Look up voters by Voter ID or National ID, view polling station info
2. **Vote Entry (APO)** — Record ballot counts per candidate at assigned polling stations
3. **Station Verification (PO)** — Verify or reject submitted station results with validation checklist
4. **Result Consolidation (ARO)** — Aggregate verified station results across a constituency
5. **Result Approval (RO)** — Approve consolidated results for public publication
6. **Public Results** — View officially published election results with vote percentage bars

### Role-Based Access Control
| Role | Permissions |
|------|------------|
| **Voter** | Search voters, view published results |
| **APO** | + Enter station vote counts |
| **PO** | + Verify/reject station results |
| **ARO** | + Consolidate constituency results |
| **RO** | + Approve & publish results |
| **Admin** | + Full master data management, audit logs |

### Admin Panel
- CRUD management for constituencies, polling stations, booths, candidates, voters, officers
- Referential integrity enforcement on deletions
- Complete audit log viewer
- Live dashboard with election progress statistics
- Reset to seed data functionality

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York style)
- **State Management**: Zustand
- **Data Persistence**: Browser localStorage
- **Icons**: Lucide React

## Pre-Seeded Data

The system loads with a realistic minimal dataset on first run:
- 2 Constituencies (Dhaka-12, Dhaka-13)
- 4 Polling Stations (2 per constituency)
- 8 Polling Booths (2 per station)
- 7 Candidates (3-4 per constituency, with party names and symbols)
- 10 Voters distributed across booths
- 13 Officers (APO, PO, ARO, RO per station/constituency + Admin)

All data persists in `localStorage` and can be reset to seed values from the Admin Panel.

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Open http://localhost:3000
```

## Agile Development

This project is designed for iterative development. Key architectural decisions:

- **Modular components** in `src/components/election/` — easy to add/modify features
- **Centralized data layer** in `src/lib/election/` — types, storage, and store separated
- **Role permission matrix** in `storage.ts` — easy to extend with new roles/tabs
- **Zustand store** — predictable state management for new features
- **shadcn/ui** — consistent design system, easy to add new UI components

### Adding a New Feature

1. Define new types in `src/lib/election/types.ts`
2. Update seed data if needed in `src/lib/election/seed-data.ts`
3. Add storage helpers in `src/lib/election/storage.ts`
4. Create a new component in `src/components/election/`
5. Register the tab in `ElectionApp.tsx` and `ROLE_TABS` in `storage.ts`
6. Update permissions in `ROLE_TABS` as needed

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Auto-deploys on every push

### Manual
```bash
bun run build
bun run start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Entry point → renders ElectionApp
│   └── globals.css         # Global styles
├── components/
│   ├── election/
│   │   ├── ElectionApp.tsx # Main shell (header, tabs, footer)
│   │   ├── HomeTab.tsx     # Dashboard & welcome
│   │   ├── VoterSearch.tsx # Voter lookup
│   │   ├── VoteEntry.tsx   # APO ballot entry
│   │   ├── StationVerification.tsx # PO verification
│   │   ├── Consolidation.tsx # ARO aggregation
│   │   ├── Approval.tsx    # RO approval
│   │   ├── PublicResults.tsx # Published results
│   │   └── AdminPanel.tsx  # Admin CRUD & audit
│   └── ui/                 # shadcn/ui components
├── lib/
│   └── election/
│       ├── types.ts        # TypeScript type definitions
│       ├── seed-data.ts    # Pre-seeded sample data
│       ├── storage.ts      # localStorage CRUD + helpers
│       ├── store.ts        # Zustand global state
│       └── index.ts        # Barrel exports
```

## License

Prototype — For demonstration purposes only.
