import { getStats, getAgeDistribution, getEducationDistribution, getProfessionDistribution, getMembersByCity } from "@/data/dummyData";
import { ChartCard } from "@/components/ChartCard";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, UserCheck, Heart, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["hsl(220, 70%, 50%)", "hsl(160, 50%, 45%)", "hsl(35, 90%, 55%)", "hsl(280, 60%, 55%)", "hsl(0, 70%, 55%)", "hsl(190, 70%, 50%)"];

export default function ReportsPage() {
  const stats = getStats();
  const ageData = getAgeDistribution();
  const eduData = getEducationDistribution();
  const profData = getProfessionDistribution();
  const cityData = getMembersByCity();
  const { toast } = useToast();

  const handleExport = (type: string) => toast({ title: `Export to ${type} (demo)` });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Community statistics and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("Excel")}><Download className="h-4 w-4 mr-1" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("PDF")}><Download className="h-4 w-4 mr-1" /> PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Families" value={stats.totalFamilies} color="text-primary" />
        <StatCard icon={UserCheck} label="Members" value={stats.totalMembers} color="text-secondary" />
        <StatCard icon={Users} label="Male" value={stats.males} color="text-primary" />
        <StatCard icon={Users} label="Female" value={stats.females} color="text-accent" />
        <StatCard icon={Heart} label="Married" value={stats.married} color="text-secondary" />
        <StatCard icon={Heart} label="Unmarried" value={stats.unmarried} color="text-primary" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Age Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ageData}><XAxis dataKey="range" /><YAxis /><Tooltip /><Bar dataKey="count" fill="hsl(220, 70%, 50%)" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Education Statistics">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart><Pie data={eduData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name,value})=>`${name}: ${value}`}>
              {eduData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Profession Statistics">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={profData} layout="vertical"><XAxis type="number" /><YAxis dataKey="name" type="category" width={100} tick={{fontSize:11}} /><Tooltip /><Bar dataKey="value" fill="hsl(160, 50%, 45%)" radius={[0,4,4,0]} /></BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Members by City">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cityData}><XAxis dataKey="city" tick={{fontSize:11}} /><YAxis /><Tooltip /><Bar dataKey="count" fill="hsl(35, 90%, 55%)" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
