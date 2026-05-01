import { useState } from "react";
import type { AnalyzedOrder } from "@/lib/types";

interface OrdersTableProps {
  orders: AnalyzedOrder[];
  onSelectOrder: (order: AnalyzedOrder) => void;
  selectedOrderId?: string;
}

type SortKey = "id" | "distance" | "orderValue" | "successProbability" | "priorityScore" | "expectedProfit" | "confidenceScore";

const riskBadge = (r: string) => {
  const cls = r === "low" ? "risk-badge-low" : r === "medium" ? "risk-badge-medium" : "risk-badge-high";
  const label = r === "low" ? "🟢 Low" : r === "medium" ? "🟡 Medium" : "🔴 High";
  return <span className={`${cls} px-2 py-0.5 rounded-full text-xs font-medium`}>{label}</span>;
};

const confBadge = (level: string, score: number) => {
  const cls = level === "High" ? "text-risk-low bg-risk-low/10" : level === "Medium" ? "text-risk-medium bg-risk-medium/10" : "text-risk-high bg-risk-high/10";
  return (
    <span className={`${cls} px-2 py-0.5 rounded-full text-[10px] font-medium`} title={`Confidence: ${score}%`}>
      {score}%
    </span>
  );
};

export function OrdersTable({ orders, onSelectOrder, selectedOrderId }: OrdersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("priorityScore");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...orders].sort((a, b) => {
    const va = a[sortKey] as number;
    const vb = b[sortKey] as number;
    return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const headerCls = "text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors px-3 py-3 text-left";

  return (
    <div className="metric-card overflow-hidden mb-6">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Orders — Optimized Sequence</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className={headerCls} onClick={() => toggleSort("id")}>Order ID</th>
              <th className={`${headerCls} hidden sm:table-cell`}>Location</th>
              <th className={headerCls} onClick={() => toggleSort("distance")}>Distance</th>
              <th className={headerCls} onClick={() => toggleSort("orderValue")}>Value</th>
              <th className={`${headerCls} hidden md:table-cell`}>Type</th>
              <th className={headerCls} onClick={() => toggleSort("successProbability")}>Success %</th>
              <th className={`${headerCls} hidden md:table-cell`}>Risk</th>
              <th className={headerCls} onClick={() => toggleSort("expectedProfit")}>Profit</th>
              <th className={headerCls} onClick={() => toggleSort("confidenceScore")}>Conf.</th>
              <th className={headerCls} onClick={() => toggleSort("priorityScore")}>Priority</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((o, i) => (
              <tr
                key={o.id}
                onClick={() => onSelectOrder(o)}
                className={`border-b border-border/30 cursor-pointer transition-colors hover:bg-accent/50 ${selectedOrderId === o.id ? "table-row-highlight" : ""} ${i < 3 ? "bg-primary/5" : ""}`}
              >
                <td className="px-3 py-2.5 font-mono text-xs text-foreground">{o.id}</td>
                <td className="px-3 py-2.5 hidden sm:table-cell text-muted-foreground">{o.location}</td>
                <td className="px-3 py-2.5 font-mono">{o.distance} km</td>
                <td className="px-3 py-2.5 font-mono">₹{o.orderValue}</td>
                <td className="px-3 py-2.5 hidden md:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${o.paymentType === "Prepaid" ? "bg-primary/15 text-primary" : "bg-accent text-muted-foreground"}`}>
                    {o.paymentType}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono">{Math.round(o.successProbability * 100)}%</td>
                <td className="px-3 py-2.5 hidden md:table-cell">{riskBadge(o.riskCategory)}</td>
                <td className={`px-3 py-2.5 font-mono ${o.expectedProfit >= 0 ? "text-risk-low" : "text-risk-high"}`}>₹{o.expectedProfit}</td>
                <td className="px-3 py-2.5">{confBadge(o.confidenceLevel, o.confidenceScore)}</td>
                <td className="px-3 py-2.5 font-mono font-semibold text-primary">{o.priorityScore.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
