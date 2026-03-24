import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
  options: { label: string; value: string }[];
}

interface SearchFiltersProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  filters: FilterOption[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

export function SearchFilters({ searchValue, onSearchChange, filters, filterValues, onFilterChange, onReset }: SearchFiltersProps) {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." value={searchValue} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filters.map((f) => (
          <Select key={f.value} value={filterValues[f.value] || "all"} onValueChange={(v) => onFilterChange(f.value, v)}>
            <SelectTrigger className="text-sm"><SelectValue placeholder={f.label} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {f.label}</SelectItem>
              {f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={onReset}><RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset</Button>
    </div>
  );
}
