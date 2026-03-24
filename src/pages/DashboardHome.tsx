import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
    Users,
    UserPlus,
    Heart,
    TrendingUp,
    TrendingDown,
    Minus,
    BarChart3,
    AlertTriangle,
    FileText,
    MapPin,
    Activity,
    ClipboardList,
    ChevronRight,
    Search,
    Filter,
    Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { dashboardAPI } from '@/services/dashboardApi';

// Interfaces for our Production Community Dashboard
interface CommunityInsights {
    overview: {
        totalFamilies: number;
        totalMembers: number;
        unmarriedProfiles: number;
        activeLocations: number;
        growthRate: number;
        growthTrend: 'up' | 'down' | 'neutral';
        dataCompletionRate: number;
    };
    genderDistribution: {
        males: number;
        females: number;
        ratio: string;
    };
    geographicRisks: {
        unmappedFamilies: { area: string; count: number }[];
        inactiveWards: { ward: string; lastActivity: string }[];
        lowCoverageZones: { zone: string; percentage: number }[];
    };
    matrimonialIntelligence: {
        newProfilesThisWeek: number;
        popularAgeRange: string;
        pendingVerifications: number;
        successfulMatchesThisMonth: number;
    };
    recentActivity: {
        type: 'registration' | 'update' | 'match' | 'location';
        text: string;
        time: string;
    }[];
    quickStats: {
        verifiedMembers: number;
        totalCasteCategories: number;
        digitalvotersCount: number;
    };
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const DashboardHome = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [insights, setInsights] = useState<CommunityInsights | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await dashboardAPI.getDashboardInsights();
                setInsights(response.data);
            } catch (err: unknown) {
                console.error('Failed to fetch Dashboard insights:', err);
                const e = err as { response?: { data?: { detail?: string }; status?: number } };
                const msg = e.response?.data?.detail || 'Failed to load community insights. Please ensure the backend is running.';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-heading text-foreground mb-2">Community Dashboard</h1>
                </div>
                <Alert variant="destructive" className="max-w-2xl border-2">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle className="font-heading font-semibold">Connection Error</AlertTitle>
                    <AlertDescription className="mt-2 text-sm leading-relaxed">
                        {error}
                        <div className="mt-4 pt-4 border-t border-destructive/20">
                            <p className="font-semibold mb-2 italic text-xs uppercase tracking-wider">Debug Info:</p>
                            <ul className="text-xs space-y-1 opacity-90">
                                <li>Logged as: <Badge variant="outline" className="text-[10px] ml-1">{user?.role?.toUpperCase()}</Badge></li>
                                <li>Endpoint: /api/dashboard/insights/</li>
                            </ul>
                            <div className="mt-4 flex gap-2">
                              <Button variant="outline" size="sm" className="bg-white/10" onClick={() => window.location.reload()}>Retry Connection</Button>
                              <Button variant="outline" size="sm" className="bg-white/10" asChild>
                                <Link to={`/${user?.role?.replace('_', '-')}/families`}>View Raw Data</Link>
                              </Button>
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const data = insights!;
    const overview = data.overview;
    const gender = data.genderDistribution;
    const geoRisks = data.geographicRisks;
    const matrimony = data.matrimonialIntelligence;
    const stats = data.quickStats;

    const totalRisks = geoRisks.unmappedFamilies.length + geoRisks.inactiveWards.length + geoRisks.lowCoverageZones.length;

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Community Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Panchratna Census Analytics — Real-time Health Snapshot
                    </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filter View
                  </Button>
                  <Button size="sm" className="flex items-center gap-2" asChild>
                    <Link to={`/${user?.role?.replace('_', '-')}/families`}>
                      <UserPlus className="h-4 w-4" /> Add New Family
                    </Link>
                  </Button>
                </div>
            </div>

            {/* 1. Summary Cards Grid */}
            <section className="animate-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="glass-card border-none hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-5 flex justify-between items-start">
                            <div>
                                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Total Families</p>
                                <p className="text-3xl font-bold mt-1">{overview.totalFamilies}</p>
                                <div className="mt-2 flex items-center gap-1">
                                    <TrendIcon trend={overview.growthTrend} />
                                    <span className="text-[10px] font-medium text-muted-foreground">+{overview.growthRate}% monthly</span>
                                </div>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <Users className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-5 flex justify-between items-start">
                            <div>
                                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Total Members</p>
                                <p className="text-3xl font-bold mt-1">{overview.totalMembers}</p>
                                <div className="mt-2 flex items-center gap-1">
                                    <span className="text-[10px] font-medium text-muted-foreground">M:F Ratio — </span>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{gender.ratio}</Badge>
                                </div>
                            </div>
                            <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                                <Activity className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-5 flex justify-between items-start">
                            <div>
                                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Matrimonial Profiles</p>
                                <p className="text-3xl font-bold mt-1 text-primary">{overview.unmarriedProfiles}</p>
                                <div className="mt-2 flex items-center gap-1">
                                    <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                                    <span className="text-[10px] font-medium text-muted-foreground">{matrimony.newProfilesThisWeek} new this week</span>
                                </div>
                            </div>
                            <div className="p-2 bg-accent/10 rounded-xl text-accent">
                                <Heart className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-5 flex justify-between items-start">
                            <div>
                                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Data Completion</p>
                                <p className="text-3xl font-bold mt-1">{overview.dataCompletionRate}%</p>
                                <div className="mt-3 w-full max-w-[100px]">
                                  <Progress value={overview.dataCompletionRate} className="h-1.5" />
                                </div>
                            </div>
                            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-600">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* 2. Insights + 3. Matrimonial Snapshot */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-gray-400" /> Geographic Insights
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                           <Card className="glass-card border-none">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">Coverage by Ward</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                  {geoRisks.lowCoverageZones.map((zone, i) => (
                                    <div key={i} className="space-y-1.5">
                                      <div className="flex justify-between text-xs font-medium">
                                        <span>{zone.zone}</span>
                                        <span className={zone.percentage < 50 ? "text-destructive" : "text-muted-foreground"}>{zone.percentage}%</span>
                                      </div>
                                      <Progress value={zone.percentage} className={`h-1.5 ${zone.percentage < 50 ? "bg-red-100 dark:bg-red-950/20" : ""}`} />
                                    </div>
                                  ))}
                              </CardContent>
                           </Card>
                           
                           <Card className="glass-card border-none relative overflow-hidden group">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">Growth Analytics</CardTitle>
                              </CardHeader>
                              <CardContent className="h-32 flex flex-col justify-end">
                                <div className="flex items-end gap-1 h-20">
                                    {[40, 60, 45, 70, 85, 65, 90].map((h, i) => (
                                      <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-colors rounded-t-sm" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground text-center mt-3 uppercase tracking-tighter">Last 7 months registration trend</p>
                              </CardContent>
                           </Card>
                        </div>
                    </section>

                    <section>
                      <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" /> Critical Data Gaps
                      </h2>
                      <Card className="border-amber-500/20 bg-amber-500/[0.02]">
                        <CardContent className="p-0">
                          <TableComponent risks={geoRisks} />
                        </CardContent>
                      </Card>
                    </section>
                </div>

                <div className="space-y-6">
                  <section>
                        <h2 className="text-lg font-heading font-bold mb-4">Matrimonial Health</h2>
                        <Card className="glass-card border-none bg-accent/5">
                            <CardContent className="p-6 space-y-5">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                    <Heart className="h-6 w-6 fill-red-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">Matched This Month</p>
                                    <p className="text-2xl font-bold">{matrimony.successfulMatchesThisMonth}</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-4 pt-2 border-t border-accent/10">
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-muted-foreground font-medium">Pending Verification</span>
                                      <Badge variant="destructive" className="h-5">{matrimony.pendingVerifications}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-muted-foreground font-medium">Popular Age Range</span>
                                      <span className="font-bold">{matrimony.popularAgeRange}</span>
                                    </div>
                                    <Button className="w-full mt-2" variant="outline" asChild>
                                      <Link to={`/${user?.role?.replace('_', '-')}/matching`}>
                                        Open Profiles <ChevronRight className="h-4 w-4 ml-1" />
                                      </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                  </section>

                  <section>
                        <h2 className="text-lg font-heading font-bold mb-4">Quick Stats</h2>
                        <div className="space-y-3">
                           {[
                             { label: 'Verified Members', value: stats.verifiedMembers, icon: UserPlus },
                             { label: 'Caste Categories', value: stats.totalCasteCategories, icon: Filter },
                             { label: 'Digital IDs Issued', value: stats.digitalvotersCount, icon: FileText }
                           ].map((item, i) => (
                             <Card key={i} className="glass-card border-none hover:bg-accent/5 cursor-default transition-colors">
                               <CardContent className="p-3 flex items-center gap-3">
                                 <div className="p-1.5 bg-muted rounded-md text-muted-foreground"><item.icon className="h-4 w-4" /></div>
                                 <div className="flex-1">
                                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{item.label}</p>
                                   <p className="text-sm font-bold">{item.value.toLocaleString()}</p>
                                 </div>
                               </CardContent>
                             </Card>
                           ))}
                        </div>
                  </section>
                </div>
            </div>

            {/* 4. Activity Feed & Actions Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                <section>
                  <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-gray-400" /> Recent Activity
                  </h2>
                  <Card className="glass-card border-none max-h-[400px] overflow-y-auto">
                    <CardContent className="p-2">
                      {data.recentActivity.map((activity, i) => (
                        <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors border-b last:border-0 border-muted/50">
                          <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                            activity.type === 'registration' ? 'bg-green-500' : 
                            activity.type === 'match' ? 'bg-red-500' : 
                            activity.type === 'location' ? 'bg-blue-500' : 'bg-gray-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{activity.text}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </section>

                <section>
                  <h2 className="text-lg font-heading font-bold mb-4">Quick Workspace Hub</h2>
                  <div className="grid grid-cols-2 gap-4">
                      <HubButton icon={Users} label="Family DB" path={`/${user?.role?.replace('_', '-')}/families`} />
                      <HubButton icon={BarChart3} label="View Analytics" path={`/${user?.role?.replace('_', '-')}/reports`} />
                      <HubButton icon={ClipboardList} label="Pending Tasks" path="#" disabled />
                      {user?.role !== 'ward_volunteer' && <HubButton icon={Shield} label="User Control" path={`/${user?.role?.replace('_', '-')}/panel`} />}
                      <HubButton icon={Search} label="Global Search" path={`/${user?.role?.replace('_', '-')}/directory`} />
                      <HubButton icon={MapPin} label="Area Map" path="#" disabled />
                  </div>
                </section>
            </div>
        </div>
    );
};

const HubButton = ({ icon: Icon, label, path, disabled }: { icon: any; label: string; path: string; disabled?: boolean }) => (
  <Button asChild={!disabled} disabled={disabled} variant="outline" className="h-20 flex-col gap-2 glass-card border-none hover:bg-primary/5 hover:text-primary transition-all group shadow-sm bg-white dark:bg-black/20">
    {disabled ? (
      <>
        <Icon className="h-5 w-5 opacity-40" />
        <span className="text-xs font-semibold opacity-40">{label}</span>
      </>
    ) : (
      <Link to={path}>
        <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-semibold">{label}</span>
      </Link>
    )}
  </Button>
);

const TableComponent = ({ risks }: { risks: CommunityInsights['geographicRisks'] }) => (
  <div className="divide-y divide-amber-100 dark:divide-amber-950/20">
    {risks.unmappedFamilies.slice(0, 3).map((r, i) => (
      <div key={i} className="px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-1.5 h-5 text-[10px]">FIX REQUIRED</Badge>
          <span className="text-sm font-semibold">{r.count} families unmapped in {r.area}</span>
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-amber-100 dark:hover:bg-amber-950/40">Resolve</Button>
      </div>
    ))}
    {risks.inactiveWards.slice(0, 2).map((w, i) => (
      <div key={i} className="px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-none px-1.5 h-5 text-[10px]">CRITICAL</Badge>
          <span className="text-sm font-semibold">{w.ward} ward reported zero activity since {w.lastActivity}</span>
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-destructive/10">Follow up</Button>
      </div>
    ))}
  </div>
);

export default DashboardHome;
