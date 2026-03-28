import { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Eye, Pencil, Trash2, Plus, Search, User as UserIcon, 
  ArrowUpDown, ChevronLeft, ChevronRight, CheckSquare, Square, 
  Filter, LayoutGrid, LayoutList, MapPinned, Building2, Phone, Heart, Users
} from "lucide-react";
import { Link } from "react-router-dom";
import MemberFormDialog from "@/components/MemberFormDialog";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { getMembers, deleteMember } from "@/services/membersApi";
import { getFamilies } from "@/services/familiesApi";
import { getLocations } from "@/services/locationsApi";
import { getCommunities } from "@/services/communitiesApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SortConfig = {
  key: string; direction: 'asc' | 'desc' | null;
};

export default function MembersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Data States
  const [membersData, setMembersData] = useState<any[]>([]);
  const [familiesData, setFamiliesData] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [filters, setFilters] = useState({
    community: "all",
    district: "all",
    vidhansabha: "all",
    ward: "all",
    gender: "all",
    profession: "all"
  });

  // Table States
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog State
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const apiParams: any = {};
      if (search) apiParams.search = search;
      if (filters.community !== 'all') apiParams.family__community = filters.community;
      if (filters.district !== 'all') apiParams.family__district = filters.district;
      if (filters.vidhansabha !== 'all') apiParams.family__vidhansabha = filters.vidhansabha;
      if (filters.ward !== 'all') apiParams.family__ward = filters.ward;
      if (filters.gender !== 'all') apiParams.gender = filters.gender;
      if (filters.profession !== 'all') apiParams.profession = filters.profession;

      const [memRes, famRes, locRes, commRes] = await Promise.all([
        getMembers(apiParams), getFamilies(), getLocations(), getCommunities()
      ]);
      setMembersData(memRes.data.results || memRes.data || []);
      setFamiliesData(famRes.data.results || famRes.data || []);
      setLocations(locRes.data.results || locRes.data || []);
      setCommunities(commRes.data.results || commRes.data || []);
    } catch (e) {
      console.error(e);
      setMembersData([]); // Clear stale data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, filters]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredAndSorted = useMemo(() => {
    let items = [...membersData];

    if (sortConfig.key && sortConfig.direction) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [membersData, sortConfig]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("क्या आप इस सदस्य को हटाना चाहते हैं?")) return;
    try {
      await deleteMember(id);
      toast({ title: "सदस्य हटा दिया गया" });
      fetchData();
    } catch (e) {}
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-slate-900 flex items-center gap-2">
            <UserIcon className="h-8 w-8 text-indigo-600" /> सदस्य डेटाबेस (Members DB)
          </h1>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold">Community Census Registry</p>
        </div>
        <div className="flex gap-2">
           <Button size="lg" className="rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all px-8 font-heading bg-indigo-600 hover:bg-indigo-700" onClick={() => { setSelectedMember(null); setIsDialogOpen(true); }}>
              <Plus className="h-5 w-5 mr-2" /> नया सदस्य (New Member)
           </Button>
        </div>
      </div>

      <div className="glass-card p-6 flex flex-col gap-6 bg-white shadow-xl rounded-3xl border border-slate-100">
        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
           <div className="relative col-span-1 sm:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input placeholder="नाम, मोबाइल, व्यवसाय से खोजें..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-12 h-12 rounded-xl border-slate-100 bg-slate-50/50" />
           </div>

           <Select value={filters.community} onValueChange={v => setFilters({...filters, community: v})}>
              <SelectTrigger className="h-12 rounded-xl border-slate-100 font-bold"><SelectValue placeholder="समाज" /></SelectTrigger>
              <SelectContent className="rounded-xl">
                 <SelectItem value="all">सभी समाज</SelectItem>
                 {communities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
           </Select>

           <Select value={filters.district} onValueChange={v => setFilters({...filters, district: v})}>
              <SelectTrigger className="h-12 rounded-xl border-slate-100 font-bold"><SelectValue placeholder="ज़िला" /></SelectTrigger>
              <SelectContent className="rounded-xl">
                 <SelectItem value="all">सभी ज़िले</SelectItem>
                 {locations.filter(l => l.type === 'district').map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
           </Select>

           <div className="flex gap-2">
              <Button variant="outline" className="h-12 rounded-xl border-slate-100 bg-white shadow-sm flex-1 font-bold" onClick={() => setFilters({community: "all", district: "all", vidhansabha: "all", ward: "all", gender: "all", profession: "all"})}>
                 <Filter className="h-4 w-4 mr-2" /> Reset
              </Button>
           </div>
        </div>

        {/* Level 2 Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-slate-50">
           <Select value={filters.vidhansabha} onValueChange={v => setFilters({...filters, vidhansabha: v})}>
              <SelectTrigger className="h-10 rounded-lg border-slate-50 text-[10px] font-black uppercase tracking-tighter"><SelectValue placeholder="विधानसभा" /></SelectTrigger>
              <SelectContent className="rounded-lg">
                 <SelectItem value="all">सभी विधानसभा</SelectItem>
                 {locations.filter(l => l.type === 'vidhansabha' && (filters.district === 'all' || l.parent === filters.district || l.parent_id === filters.district)).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
           </Select>
           <Select value={filters.ward} onValueChange={v => setFilters({...filters, ward: v})}>
              <SelectTrigger className="h-10 rounded-lg border-slate-50 text-[10px] font-black uppercase tracking-tighter"><SelectValue placeholder="वार्ड" /></SelectTrigger>
              <SelectContent className="rounded-lg">
                 <SelectItem value="all">सभी वार्ड</SelectItem>
                 {locations.filter(l => l.type === 'ward' && (filters.vidhansabha === 'all' || l.parent === filters.vidhansabha || l.parent_id === filters.vidhansabha)).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
           </Select>
           <Select value={filters.gender} onValueChange={v => setFilters({...filters, gender: v})}>
              <SelectTrigger className="h-10 rounded-lg border-slate-50 text-[10px] font-black uppercase tracking-tighter"><SelectValue placeholder="लिंग (Gender)" /></SelectTrigger>
              <SelectContent className="rounded-lg">
                 <SelectItem value="all">सभी</SelectItem>
                 <SelectItem value="Male">पुरुष (Male)</SelectItem>
                 <SelectItem value="Female">महिला (Female)</SelectItem>
                 <SelectItem value="Other">अन्य (Other)</SelectItem>
              </SelectContent>
           </Select>
        </div>
      </div>

      <div className="glass-card border-none shadow-2xl rounded-3xl bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50">
              <TableHead className="w-12 py-5 px-6"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedIds(selectedIds.length === paginatedData.length ? [] : paginatedData.map(d => d.id))}>{selectedIds.length === paginatedData.length ? <CheckSquare className="h-5 w-5 text-indigo-600" /> : <Square className="h-5 w-5" />}</Button></TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest cursor-pointer" onClick={() => handleSort('name')}>नाम (Name)</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">वार्ड / विधानसभा</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">संबंध / मुखिया</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">व्यवसाय</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-right pr-10">विकल्प</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" /></TableCell></TableRow>
            ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-32 bg-slate-50/20">
                     <div className="flex flex-col items-center gap-4 text-slate-300">
                        <div className="p-4 bg-white rounded-full shadow-sm shadow-slate-100 ring-1 ring-slate-100"><Search className="h-10 w-10" /></div>
                        <p className="text-sm font-black uppercase tracking-widest">No members found matching your search</p>
                        <Button variant="link" className="text-primary font-bold text-xs" onClick={() => { setSearch(""); setFilters({community: "all", district: "all", vidhansabha: "all", ward: "all", gender: "all", profession: "all"}); }}>Reset all filters</Button>
                     </div>
                  </TableCell>
                </TableRow>
            ) : paginatedData.map((m: any) => (
                <TableRow key={m.id} className="hover:bg-indigo-50/30 transition-colors">
                  <TableCell className="px-6 py-4"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSelectOne(m.id)}>{selectedIds.includes(m.id) ? <CheckSquare className="h-5 w-5 text-indigo-600" /> : <Square className="h-5 w-5" />}</Button></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                          {m.photo ? <img src={m.photo} className="h-full w-full object-cover" /> : <UserIcon className="h-5 w-5" />}
                       </div>
                       <div>
                          <p className="font-bold text-slate-800">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{m.mobile || "No Mobile"}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                      <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-700">{m.ward_name || "N/A"}</p>
                          <p className="text-[9px] uppercase text-slate-400 font-black tracking-tighter">{m.vidhansabha_name || m.district_name || "Region Unknown"}</p>
                      </div>
                  </TableCell>
                  <TableCell>
                      <div className="space-y-0.5">
                          <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">{m.relation}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[120px]">Fam: {m.family_name}</p>
                      </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="rounded-lg text-[10px] font-black opacity-70">{m.profession || "General"}</Badge></TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2 text-indigo-600">
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setSelectedMember(m); setIsDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="p-6 bg-slate-50/30 border-t flex items-center justify-between">
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total <span className="text-slate-900">{filteredAndSorted.length}</span> Members Found</p>
           <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="rounded-lg h-10 w-10"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages || totalPages === 0} className="rounded-lg h-10 w-10"><ChevronRight className="h-4 w-4" /></Button>
           </div>
        </div>
      </div>

      <MemberFormDialog 
        isOpen={isDialogOpen} 
        onClose={() => { setIsDialogOpen(false); setSelectedMember(null); }} 
        memberData={selectedMember} 
        onSuccess={fetchData} 
      />
    </div>
  );
}
