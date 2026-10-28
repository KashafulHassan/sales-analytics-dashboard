import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";

// ---------- Sample sales data (mirrors public/sales-data.json) ----------
const RAW_DATA = [
  { date: "2026-01-05", product: "Laptop Pro 14", category: "Electronics", region: "North", revenue: 124000, units: 40 },
  { date: "2026-01-08", product: "Wireless Mouse", category: "Electronics", region: "South", revenue: 4500, units: 90 },
  { date: "2026-01-12", product: "Desk Chair Elite", category: "Furniture", region: "North", revenue: 32000, units: 64 },
  { date: "2026-01-15", product: "Running Shoes X", category: "Apparel", region: "East", revenue: 18000, units: 120 },
  { date: "2026-01-20", product: "Laptop Pro 14", category: "Electronics", region: "East", revenue: 93000, units: 30 },
  { date: "2026-01-25", product: "Office Desk Wide", category: "Furniture", region: "South", revenue: 21000, units: 35 },
  { date: "2026-02-02", product: "Cotton T-Shirt", category: "Apparel", region: "West", revenue: 6400, units: 160 },
  { date: "2026-02-06", product: "Smart Watch S2", category: "Electronics", region: "North", revenue: 56000, units: 70 },
  { date: "2026-02-10", product: "Bookshelf Oak", category: "Furniture", region: "East", revenue: 15500, units: 31 },
  { date: "2026-02-14", product: "Running Shoes X", category: "Apparel", region: "North", revenue: 22500, units: 150 },
  { date: "2026-02-18", product: "Laptop Pro 14", category: "Electronics", region: "South", revenue: 111600, units: 36 },
  { date: "2026-02-22", product: "Desk Lamp LED", category: "Electronics", region: "West", revenue: 9800, units: 98 },
  { date: "2026-03-01", product: "Office Desk Wide", category: "Furniture", region: "North", revenue: 27000, units: 45 },
  { date: "2026-03-05", product: "Denim Jacket", category: "Apparel", region: "South", revenue: 17000, units: 85 },
  { date: "2026-03-09", product: "Smart Watch S2", category: "Electronics", region: "East", revenue: 72000, units: 90 },
  { date: "2026-03-14", product: "Cotton T-Shirt", category: "Apparel", region: "North", revenue: 8000, units: 200 },
  { date: "2026-03-19", product: "Desk Chair Elite", category: "Furniture", region: "West", revenue: 35000, units: 70 },
  { date: "2026-03-24", product: "Laptop Pro 14", category: "Electronics", region: "West", revenue: 105300, units: 34 },
  { date: "2026-03-28", product: "Bookshelf Oak", category: "Furniture", region: "South", revenue: 14000, units: 28 },
  { date: "2026-04-02", product: "Wireless Mouse", category: "Electronics", region: "North", revenue: 5100, units: 102 },
  { date: "2026-04-07", product: "Running Shoes X", category: "Apparel", region: "West", revenue: 24000, units: 160 },
  { date: "2026-04-12", product: "Desk Lamp LED", category: "Electronics", region: "South", revenue: 8400, units: 84 },
  { date: "2026-04-16", product: "Office Desk Wide", category: "Furniture", region: "East", revenue: 30000, units: 50 },
  { date: "2026-04-21", product: "Smart Watch S2", category: "Electronics", region: "West", revenue: 64000, units: 80 },
  { date: "2026-04-25", product: "Denim Jacket", category: "Apparel", region: "East", revenue: 12000, units: 60 },
  { date: "2026-04-29", product: "Laptop Pro 14", category: "Electronics", region: "North", revenue: 130900, units: 42 },
];

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];
const fmtPKR = (n) =>
  n >= 1000000 ? "₨ " + (n / 1000000).toFixed(2) + "M"
  : n >= 1000 ? "₨ " + Math.round(n / 1000) + "K"
  : "₨ " + n;

// ---------- KPI Card ----------
function KpiCard({ label, value, sub, delta }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {delta != null && (
          <span className={delta >= 0 ? "font-semibold text-green-600" : "font-semibold text-red-600"}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        <span className="text-slate-400">{sub}</span>
      </div>
    </div>
  );
}

// ---------- Empty state ----------
function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
      <div className="text-4xl">📭</div>
      <div className="mt-3 text-lg font-semibold text-slate-700">No sales data for these filters</div>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Try widening the date range or selecting more categories.
      </p>
      <button onClick={onReset}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        Reset filters
      </button>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/sales-data.json")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => [...new Set(RAW_DATA.map((d) => d.category))].sort(), []
  );
  const dates = RAW_DATA.map((d) => d.date).sort();
  const minDate = dates[0], maxDate = dates[dates.length - 1];

  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(maxDate);
  const [selectedCats, setSelectedCats] = useState([]);

  const toggleCat = (c) =>
    setSelectedCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const filtered = useMemo(
    () =>
      data.filter(
        (d) =>
          d.date >= startDate && d.date <= endDate &&
          (selectedCats.length === 0 || selectedCats.includes(d.category))
      ),
    [data, startDate, endDate, selectedCats]
  );

  // ---- KPIs ----
  const kpis = useMemo(() => {
    const revenue = filtered.reduce((s, d) => s + d.revenue, 0);
    const units = filtered.reduce((s, d) => s + d.units, 0);
    const avgOrder = filtered.length ? revenue / filtered.length : 0;
    const uniqueProducts = new Set(filtered.map((d) => d.product)).size;
    return { revenue, units, avgOrder, uniqueProducts };
  }, [filtered]);

  // ---- Chart data ----
  const revenueByMonth = useMemo(() => {
    const map = {};
    filtered.forEach((d) => {
      const m = d.date.slice(0, 7);
      map[m] = map[m] || { month: m, revenue: 0 };
      map[m].revenue += d.revenue;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  const salesByCategory = useMemo(() => {
    const map = {};
    filtered.forEach((d) => {
      map[d.category] = (map[d.category] || 0) + d.revenue;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const topProducts = useMemo(() => {
    const map = {};
    filtered.forEach((d) => {
      map[d.product] = (map[d.product] || 0) + d.revenue;
    });
    return Object.entries(map)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filtered]);

  const resetFilters = () => {
    setStartDate(minDate); setEndDate(maxDate); setSelectedCats([]);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans">
      <div className="mx-auto max-w-6xl">
        {/* Header + filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sales Analytics Dashboard</h1>
            <p className="text-sm text-slate-500">{filtered.length} records · Jan – Apr 2026 sample data</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-medium text-slate-600">
              From
              <input type="date" min={minDate} max={endDate} value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="ml-2 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
            </label>
            <label className="text-xs font-medium text-slate-600">
              To
              <input type="date" min={startDate} max={maxDate} value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="ml-2 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
            </label>
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} onClick={() => toggleCat(c)}
              className={
                "rounded-full px-3 py-1.5 text-xs font-medium transition " +
                (selectedCats.includes(c)
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 border border-slate-300 hover:border-indigo-400")
              }>
              {c}
            </button>
          ))}
          {selectedCats.length > 0 && (
            <button onClick={() => setSelectedCats([])}
              className="rounded-full px-3 py-1.5 text-xs text-slate-500 underline">Clear</button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </div>
            <div className="h-72 animate-pulse rounded-xl bg-slate-200" />
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="mt-6"><EmptyState onReset={resetFilters} /></div>
        )}

        {/* Dashboard */}
        {!loading && filtered.length > 0 && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Total Revenue" value={fmtPKR(kpis.revenue)} sub="filtered range" />
              <KpiCard label="Units Sold" value={kpis.units.toLocaleString()} sub="filtered range" />
              <KpiCard label="Avg. Revenue / Sale" value={fmtPKR(kpis.avgOrder)} sub="per record" />
              <KpiCard label="Products" value={kpis.uniqueProducts} sub="in view" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700">Revenue Over Time</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={fmtPKR} tick={{ fontSize: 11 }} width={70} />
                    <Tooltip formatter={(v) => fmtPKR(v)} />
                    <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700">Sales by Category</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={salesByCategory} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={95} label>
                      {salesByCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmtPKR(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700">Top Products by Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={fmtPKR} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={130} />
                  <Tooltip formatter={(v) => fmtPKR(v)} />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}