"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Row = { month: string; revenue: number; invoiceCount: number };

const FR_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export function RevenueChart({ data }: { data: Row[] }) {
  const display = data.map((r) => {
    const [, mm] = r.month.split("-");
    const idx = Number(mm) - 1;
    return { ...r, label: FR_SHORT[idx] ?? r.month };
  });
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={display}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="label" stroke="#888" fontSize={11} />
          <YAxis stroke="#888" fontSize={11} tickFormatter={(v) => `${v} €`} />
          <Tooltip
            formatter={(v) => [`${Number(v ?? 0).toFixed(2)} €`, "CA"]}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="revenue" fill="#111827" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
