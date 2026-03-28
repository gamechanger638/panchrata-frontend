import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    FileText, Download, Filter, 
    ArrowUpDown, Search, Table as TableIcon, 
    BarChart3, Users, Briefcase, MapPin 
} from 'lucide-react';
import { dashboardAPI } from '@/services/dashboardApi';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ReportsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<'member' | 'family'>('member');
    const [filters, setFilters] = useState({
        state: "", district: "", profession: "", status: ""
    });

    const handleExport = async (format: 'excel' | 'csv') => {
        try {
            setLoading(true);
            const res = await dashboardAPI.exportReport({ ...filters, format, type: reportType });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast({ title: "निर्यात सफल (Export Successful)" });
        } catch (e) {
            toast({ title: "निर्यात विफल (Export Failed)", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <h1 className="text-3xl font-heading font-black text-slate-900 flex items-center gap-3">
                        <FileText className="h-10 w-10 text-primary" /> रिपोर्ट्स एवं एनालिटिक्स (Reports)
                   </h1>
                   <p className="text-slate-500 mt-2 text-lg">समुदाय का व्यापक डेटा विश्लेषण और फ़िल्टर-आधारित रिपोर्ट</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <Button 
                        variant={reportType === 'member' ? 'default' : 'ghost'} 
                        className="rounded-xl px-6" 
                        onClick={() => setReportType('member')}
                    >
                        सदस्य (Members)
                    </Button>
                    <Button 
                        variant={reportType === 'family' ? 'default' : 'ghost'} 
                        className="rounded-xl px-6" 
                        onClick={() => setReportType('family')}
                    >
                        परिवार (Families)
                    </Button>
                </div>
            </div>

            {/* Quick Filter Section */}
            <section className="glass-card p-8 border-none shadow-xl bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <Filter className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-slate-700 uppercase tracking-wider text-sm">फ़िल्टर विकल्प (Report Scoping)</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase">राज्य (State)</label>
                        <Select onValueChange={v => setFilters({...filters, state: v})}>
                            <SelectTrigger className="h-12 rounded-xl bg-white"><SelectValue placeholder="सभी (All)" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">सभी</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase">व्यवसाय (Profession)</label>
                        <Select onValueChange={v => setFilters({...filters, profession: v})}>
                            <SelectTrigger className="h-12 rounded-xl bg-white"><SelectValue placeholder="सभी (All)" /></SelectTrigger>
                            <SelectContent>
                                {['Student', 'Business', 'Govt Job', 'Farmer', 'Other'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase">स्थिति (Status)</label>
                        <Select onValueChange={v => setFilters({...filters, status: v})}>
                            <SelectTrigger className="h-12 rounded-xl bg-white"><SelectValue placeholder="सभी (All)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">सक्रिय (Active)</SelectItem>
                                <SelectItem value="inactive">निष्क्रिय (Inactive)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end gap-2">
                        <Button 
                            className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/20 font-bold"
                            onClick={() => handleExport('excel')}
                            disabled={loading}
                        >
                            {loading ? "प्रसंस्करण..." : <><Download className="h-4 w-4 mr-2" /> Excel</>}
                        </Button>
                        <Button 
                            variant="outline"
                            className="h-12 w-12 rounded-xl border-slate-200"
                            onClick={() => handleExport('csv')}
                            disabled={loading}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Visual Guide Cards */}
            <div className="grid sm:grid-cols-3 gap-6">
               <ReportInfoCard icon={Briefcase} title="आजीविका रिपोर्ट" desc="समुदाय के पेशेवर प्रोफाइल और रोजगार के आंकड़ों का विश्लेषण करें।" />
               <ReportInfoCard icon={MapPin} title="क्षेत्रीय वितरण" desc="विभिन्न जिलों और वार्डों में जनसंख्या घनत्व और सक्रियता को ट्रैक करें।" />
               <ReportInfoCard icon={Users} title="जनसांख्यिकीय विश्लेषण" desc="लिंग अनुपात, आयु वर्ग और वैवाहिक स्थिति के आधार पर डेटा निकालें।" />
            </div>

            {/* History or Preview section Placeholder */}
            <Card className="rounded-3xl border-none shadow-sm bg-slate-50/50">
               <CardContent className="p-10 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-slate-200 shadow-sm border border-slate-100">
                     <TableIcon className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-700">रिपोर्ट जनरेट करने के लिए फ़िल्टर चुनें</h3>
                    <p className="text-slate-400 mt-1 max-w-sm mx-auto">एक बार जब आप मापदंड चुन लेते हैं, तो आप पूर्वावलोकन कर सकते हैं और पूरी रिपोर्ट डाउनलोड कर सकते हैं।</p>
                  </div>
               </CardContent>
            </Card>
        </div>
    );
}

const ReportInfoCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-default group">
        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-4">
            <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
);
