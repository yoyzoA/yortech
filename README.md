# YorTech — Daily Tech & Science Newspaper

> A fully automated daily tech newspaper for computer engineering students.
> Curated by AI, published every weekday at 08:00 GMT.

**Live at:** [yorgoassal.com/yortech](https://yorgoassal.com/yortech)

---

## Overview

YorTech is a full-stack web application that automatically generates a daily
tech and science newspaper every weekday morning. A scheduled pipeline fetches
articles from multiple sources, sends them to Claude Haiku for editorial
curation and rewriting, enriches each article with a stock image, and publishes
the result to a live website.

The project is built as a portfolio piece demonstrating end-to-end engineering
across backend services, cloud infrastructure, AI integration, and frontend
design.

---

## Features

- **Fully automated** — generates one edition every weekday at 08:00 GMT via a cron job
- **AI-curated** — Claude Haiku selects, rewrites, and summarises articles in an approachable professor voice
- **Four editorial sections** — AI & GenAI, Dev Tools & Releases, ML & AI Research, Market & Trends
- **Lead story** — one featured article chosen as the most significant story of the day
- **Stock images** — every article matched with a relevant Pexels image
- **Full attribution** — source author, publication, URL, and image credit on every article
- **Archive** — all past editions stored and browsable
- **FIFO cleanup** — editions older than 30 days are automatically deleted
- **Retro hacker zine UI** — dark terminal aesthetic with phosphor green accents and CRT scanlines

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | Neon PostgreSQL (serverless) |
| AI Curation | Claude Haiku 4.5 via Batch API |
| Scheduler | node-cron (Mon–Fri 08:00 UTC) |
| Process Manager | PM2 |
| Reverse Proxy | Nginx |
| Hosting | AWS EC2 t3.micro (us-east-1) |
| Frontend CDN | AWS S3 + CloudFront |
| DNS | AWS Route 53 |
| CI/CD | GitHub Actions |
| Monitoring | AWS CloudWatch |

---

## Project Structure

```
yortech/
├── server/                   # Node.js + Express backend
│   ├── config/               # All tunable configuration
│   │   ├── sources.js        # News source fetch behaviour
│   │   ├── categories.js     # Editorial sections + keyword hints
│   │   ├── curator.js        # Claude model, token limits, voice prompt
│   │   ├── scheduler.js      # Cron expressions, retention period
│   │   └── images.js         # Pexels settings
│   ├── db/
│   │   ├── schema.sql        # PostgreSQL table definitions
│   │   └── database.js       # Connection pool + all queries
│   ├── routes/
│   │   └── editions.js       # REST API endpoints
│   ├── services/
│   │   ├── fetcher.js        # Pulls from HN, arXiv, NewsAPI, DEV.to
│   │   ├── curator.js        # Claude Haiku Batch API integration
│   │   ├── imageService.js   # Pexels image fetching
│   │   └── scheduler.js      # Daily pipeline + cleanup cron jobs
│   ├── index.js              # Express entry point
│   └── .env.example          # Environment variable template
│
├── client/                   # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/       # ZineHeader, ArticleCard, NewsTicker, Attribution
│   │   ├── hooks/            # useEdition, useArchive
│   │   └── pages/            # Today, Archive, ArticleDetail
│   ├── vite.config.js        # base: '/yortech/'
│   └── tailwind.config.js    # Hacker zine design system
│
├── nginx/
│   └── yorgoassal.conf       # Nginx routing + SSL + security headers
│
├── portfolio/
│   └── index.html            # Portfolio placeholder at yorgoassal.com/
│
└── .github/
    └── workflows/
        └── deploy-yortech.yml  # CI/CD pipeline
```

---

## News Sources

| Source | Filter Method | Category Hint |
|---|---|---|
| Hacker News | Score > 100 + keyword whitelist | Dev Tools |
| arXiv | Categories: cs.AI, cs.LG, cs.CV, cs.CL, cs.SE, stat.ML | ML Research |
| NewsAPI | Query + relevancy sort + domain blocklist | AI & GenAI |
| DEV.to | Tag filter + top daily articles | Dev Tools |

All sources are pre-filtered before reaching Claude — reducing token usage by ~75% compared to sending raw results.

---

## API Endpoints

```
GET /api/editions           → Archive list (date + article count)
GET /api/editions/latest    → Most recent edition with all articles
GET /api/editions/:date     → Specific edition by date (YYYY-MM-DD)
GET /health                 → Server health check
```

---

## Local Development

### Prerequisites

- Node.js 20+
- A Neon PostgreSQL account (neon.tech — free)
- An Anthropic API key (console.anthropic.com)
- A NewsAPI key (newsapi.org — free)
- A Pexels API key (pexels.com/api — free)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/yorgoassal/yortech.git
cd yortech

# 2. Install server dependencies
cd server && npm install && cd ..

# 3. Install client dependencies
cd client && npm install && cd ..

# 4. Configure environment variables
cp server/.env.example server/.env
# Edit server/.env and fill in all four API keys

# 5. Initialise the database
# Paste server/db/schema.sql into your Neon SQL editor
# Or run: psql $DATABASE_URL -f server/db/schema.sql

# 6. Start the backend (development mode)
cd server && npm run dev

# 7. Start the frontend (separate terminal)
cd client && npm run dev

# Frontend: http://localhost:5173/yortech
# Backend:  http://localhost:3001
```

### Manually Trigger a Test Edition

The scheduler only runs automatically in production. To generate a test edition locally:

```js
// In a separate file or Node REPL:
require('dotenv').config({ path: './server/.env' });
const { generateEdition } = require('./server/services/scheduler');
generateEdition('2026-04-09');
```

---

## Deployment

### First Deployment (Manual)

```bash
# 1. SSH into your EC2 instance
ssh ec2-user@<your-ec2-ip>

# 2. Clone the repository
git clone https://github.com/yorgoassal/yortech.git ~/yortech

# 3. Install dependencies
cd ~/yortech/server && npm ci --omit=dev

# 4. Create .env file
cp ~/yortech/server/.env.example ~/yortech/server/.env
# Fill in all API keys using nano or vim

# 5. Initialise database
psql $DATABASE_URL -f ~/yortech/server/db/schema.sql

# 6. Start with PM2
pm2 start ~/yortech/server/index.js \
  --name yortech-server \
  --env production
pm2 save
pm2 startup   # auto-start on EC2 reboot

# 7. Configure Nginx
sudo cp ~/yortech/nginx/yorgoassal.conf /etc/nginx/conf.d/
sudo certbot --nginx -d yorgoassal.com -d www.yorgoassal.com
sudo nginx -t && sudo systemctl reload nginx

# 8. Build and deploy the frontend
cd ~/yortech/client && npm ci && npm run build
```

### Subsequent Deployments (Automated)

Push to `main` — GitHub Actions handles everything automatically.

### Required GitHub Secrets

| Secret | Value |
|---|---|
| `EC2_HOST` | EC2 public IP address |
| `EC2_USER` | `ec2-user` |
| `EC2_SSH_KEY` | Contents of your `.pem` private key |
| `EC2_APP_DIR` | `/home/ec2-user/yortech` |

---

## Configuration

All tunable behaviour lives in `server/config/`. No logic changes needed for common adjustments:

| File | What you can change |
|---|---|
| `sources.js` | Keyword whitelist, score threshold, article limits per source |
| `categories.js` | Section keywords, max articles per category |
| `curator.js` | AI model, token limits, editorial voice prompt |
| `scheduler.js` | Generation time, retention period |
| `images.js` | Image provider, orientation, fallback |

---

## Cost

| Service | Monthly Cost |
|---|---|
| AWS EC2 t3.micro | $7.59 |
| AWS EBS 20GB | $1.60 |
| AWS S3 + CloudFront | ~$1.00 |
| AWS Route 53 | $1.50 |
| Neon PostgreSQL | $0.00 (free tier) |
| Claude Haiku 4.5 (Batch API) | ~$0.06 |
| NewsAPI + Pexels | $0.00 (free tier) |
| **Total** | **~$11.75 / month** |

---

## Author

**Yorgo Assal** — Computer Engineering Student
[yorgoassal.com](https://yorgoassal.com)

---

## License

MIT — feel free to fork and adapt for your own use.
