import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Users, UserPlus, Heart, TrendingUp, BarChart3, 
    Download, Calendar, MapPin, Briefcase, GraduationCap, 
    Filter, X, Search, Activity, UserCheck, UserX, Lightbulb
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { dashboardAPI } from '@/services/dashboardApi';
import { getLocations } from '@/services/locationsApi';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

type FilterState = {
    state: string;
    district: string;
    ward: string;
    profession: string;
    education: string;
    gender: string;
    status: string;
    date_from: string;
    date_to: string;
};

const DashboardHome = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [locations, setLocations] = useState<any[]>([]);
    const [filters, setFilters] = useState<FilterState>({
        state: "",
        district: "",
        ward: "",
        profession: "",
        education: "",
        gender: "",
        status: "",
        date_from: "",
        date_to: "",
    });

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const fetchAnalytics = async (f: FilterState) => {
        try {
            setLoading(true);
            const cleanFilters = Object.fromEntries(Object.entries(f).filter(([_, v]) => v !== ""));
            const res = await dashboardAPI.getDashboardInsights(cleanFilters);
            setData(res.data);
        } catch (e) {
            toast({ title: "डेटा लोड करने में विफल (Failed to load data)", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            const locRes = await getLocations();
            setLocations(locRes.data.results || locRes.data || []);
            fetchAnalytics(filters);
        } catch (e) {}
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        fetchAnalytics(newFilters);
    };

    const clearFilters = () => {
        const emptyFilters = {
            state: "", district: "", ward: "", profession: "", education: "",
            gender: "", status: "", date_from: "", date_to: ""
        };
        setFilters(emptyFilters);
        fetchAnalytics(emptyFilters);
    };

    const handleExport = async (format: 'excel' | 'csv', type: 'member' | 'family') => {
        try {
            const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""));
            const res = await dashboardAPI.exportReport({ ...cleanFilters, format, type });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            toast({ title: "निर्यात विफल (Export Failed)", variant: "destructive" });
        }
    };

    const states = useMemo(() => locations.filter(l => l.type === 'state'), [locations]);
    const districts = useMemo(() => {
        if (!filters.state) return [];
        return locations.filter(l => l.type === 'district' && l.parent === filters.state);
    }, [locations, filters.state]);

    if (loading && !data) return <div className="h-[80vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

    const metrics = data?.metrics || {};
    const charts = data?.charts || {};
    const insights = data?.insights || {};

    return (
        <div className="p-4 md:p-8 space-y-8 bg-[#f8fafc] min-h-screen">
            {/* Header & Sticky Filter Bar */}
            <div className="sticky top-0 z-10 -mx-4 md:-mx-8 px-4 md:px-8 py-4 bg-white/80 backdrop-blur-md border-b shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-slate-900">Admin Analytics Dashboard</h1>
                        <p className="text-sm text-slate-500">Real-time community metrics and advanced reporting</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant={isFilterOpen ? "default" : "outline"} 
                            className="rounded-xl gap-2"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <Filter className="h-4 w-4" /> 
                            {isFilterOpen ? "फ़िल्टर छिपाएं" : "फ़िल्टर दिखाएं"}
                        </Button>
                        <div className="flex gap-2">
                            <Select onValueChange={(v) => handleExport(v as any, 'member')}>
                                <SelectTrigger className="w-[140px] rounded-xl bg-primary text-primary-foreground">
                                    <Download className="h-4 w-4 mr-2" /> <SelectValue placeholder="निर्यात (Export)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {isFilterOpen && (
                    <div className="max-w-7xl mx-auto mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400">राज्य (State)</label>
                                <Select value={filters.state} onValueChange={v => handleFilterChange('state', v)}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="सभी" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_none">सभी</SelectItem>
                                        {states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400">जिला (District)</label>
                                <Select value={filters.district} onValueChange={v => handleFilterChange('district', v)} disabled={!filters.state}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="सभी" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_none">सभी</SelectItem>
                                        {districts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400">व्यवसाय (Profession)</label>
                                <Select value={filters.profession} onValueChange={v => handleFilterChange('profession', v)}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="सभी" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_none">सभी</SelectItem>
                                        {['Student', 'Engineer', 'Doctor', 'Advocate', 'Business', 'Farmer', 'Housewife', 'Govt Job', 'Other'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400">लिंग (Gender)</label>
                                <Select value={filters.gender} onValueChange={v => handleFilterChange('gender', v)}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="सभी" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_none">सभी</SelectItem>
                                        <SelectItem value="male">पुरुष</SelectItem>
                                        <SelectItem value="female">महिला</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button variant="ghost" className="w-full text-slate-500 rounded-xl" onClick={clearFilters}>
                                    <X className="h-4 w-4 mr-2" /> साफ़ करें
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="कुल परिवार (Total Families)" 
                    value={metrics.totalFamilies} 
                    icon={Users} 
                    color="blue"
                    subText={`आज +${metrics.newRegistrations?.today || 0}`}
                />
                <MetricCard 
                    title="कुल सदस्य (Total Members)" 
                    value={metrics.totalMembers} 
                    icon={UserPlus} 
                    color="purple"
                    subText={`${metrics.newRegistrations?.last7Days || 0} पिछले 7 दिनों में`}
                />
                <MetricCard 
                    title="सक्रिय सदस्य (Active Members)" 
                    value={metrics.activeMembers} 
                    icon={UserCheck} 
                    color="green"
                    subText={`${((metrics.activeMembers/metrics.totalMembers)*100).toFixed(1)}% सक्रियता`}
                />
                <MetricCard 
                    title="निष्क्रिय सदस्य (Inactive)" 
                    value={metrics.inactiveMembers} 
                    icon={UserX} 
                    color="orange"
                    subText="सत्यापन लंबित (Pending Verification)"
                />
            </div>

            {/* Main Charts Section */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Growth Trend Chart */}
                <Card className="lg:col-span-2 rounded-2xl shadow-sm border-none bg-white overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                             <TrendingUp className="h-5 w-5 text-primary" /> सदस्य वृद्धि रुझान (Member Growth Trend)
                        </CardTitle>
                        <CardDescription>पिछले 31 दिनों के पंजीकरण (Daily Registrations)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] p-6 pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.growthTrend}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: 'white', strokeWidth: 2 }} 
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Profession Distribution Pie */}
                <Card className="rounded-2xl shadow-sm border-none bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-slate-400" /> व्यवसाय वितरण (Profession)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] flex items-center justify-center p-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.professionDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="profession"
                                >
                                    {charts.professionDistribution?.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Location Wise Bar Chart */}
                <Card className="rounded-2xl shadow-sm border-none bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-slate-400" /> जिला-वार डेटा (Location Analysis)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.locationDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="district__name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Smart Insights & Alerts */}
                <Card className="rounded-2xl shadow-sm border-none bg-primary/5 border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" /> स्मार्ट अंतर्दृष्टि (Smart Insights)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary"><Activity className="h-5 w-5" /></div>
                            <div>
                                <p className="font-bold text-slate-800">सर्वाधिक सक्रिय क्षेत्र (Top Area)</p>
                                <p className="text-sm text-slate-500">{insights.mostActiveArea} क्षेत्र में इस सप्ताह सबसे अधिक पंजीकरण हुए हैं।</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                            <div className="bg-orange-500/10 p-2 rounded-lg text-orange-600"><Briefcase className="h-5 w-5" /></div>
                            <div>
                                <p className="font-bold text-slate-800">प्रमुख व्यवसाय (Lead Profession)</p>
                                <p className="text-sm text-slate-500">{insights.topProfession} वर्ग के लोग समुदाय में सबसे अधिक सक्रिय हैं।</p>
                            </div>
                        </div>
                        <div className="p-4 border-2 border-dashed border-primary/20 rounded-xl">
                            <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">सिफ़ारिश (Recommendation)</p>
                            <p className="text-sm text-slate-600">अधूरे प्रोफाइल वाले सदस्यों को SMS रिमाइंडर्स भेजकर डेटा पूर्णता बढ़ाएं।</p>
                            <Button variant="link" className="p-0 h-auto text-primary text-xs mt-2">कार्रवाई करें (Take Action) →</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon: Icon, color, subText }: { title: string, value: any, icon: any, color: string, subText: string }) => {
    const colorClasses: Record<string, string> = {
        blue: "text-blue-600 bg-blue-50",
        purple: "text-purple-600 bg-purple-50",
        green: "text-green-600 bg-green-50",
        orange: "text-orange-600 bg-orange-50",
    };

    return (
        <Card className="rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-none bg-white group overflow-hidden">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{title}</p>
                    <p className="text-3xl font-black text-slate-900 mb-1">{value?.toLocaleString() || 0}</p>
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                        {subText}
                    </p>
                </div>
            </CardContent>
            <div className={`h-1 w-full bg-${color}-500 opacity-20`} />
        </Card>
    );
};

export default DashboardHome;
