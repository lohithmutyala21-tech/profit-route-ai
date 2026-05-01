import { useRef } from "react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/types";
import { generateSampleOrders, parseCSV } from "@/lib/engine";

interface DataInputProps {
  onDataLoaded: (orders: Order[]) => void;
  codPct: number;
  riskMult: number;
  avgValue: number;
}

export function DataInput({ onDataLoaded, codPct, riskMult, avgValue }: DataInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const orders = parseCSV(text);
      if (orders.length > 0) onDataLoaded(orders);
    };
    reader.readAsText(file);
  };

  return (
    <div className="metric-card p-6 mb-6">
      <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Data Input</h2>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => onDataLoaded(generateSampleOrders(30, codPct, riskMult, avgValue))}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Generate Sample Orders
        </Button>
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          className="border-border text-foreground hover:bg-accent"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload CSV
        </Button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        CSV fields: Order ID, Location, Distance, Order Value, Payment Type, Customer Reliability
      </p>
    </div>
  );
}
