# Sales Analytics Dashboard

A responsive dashboard that visualizes sales data from a JSON file, built with React, Vite, and Recharts.

## Features
- 4 KPI cards: Total Revenue, Units Sold, Avg Revenue/Sale, Product Count
- 3 charts: Revenue Over Time (line), Sales by Category (pie), Top Products by Revenue (bar)
- Date-range and category filters that update all KPIs and charts together
- Loading and empty states (with a "Reset filters" action)

## Setup
```bash
npm install
npm run dev
```
Then open http://localhost:5173

## Data
Edit `public/sales-data.json` to use your own data. Each record needs:
`date` (YYYY-MM-DD), `product`, `category`, `region`, `revenue` (number), `units` (number).

## Build for production
```bash
npm run build
```
Output goes to `dist/`.