import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  color?: string;
}

export function StatCard({ icon: Icon, label, value, trend, color = "text-primary" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 hover-lift"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-muted ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && <span className="text-xs font-medium text-secondary">{trend}</span>}
      </div>
      <p className="text-2xl font-bold font-heading text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}
