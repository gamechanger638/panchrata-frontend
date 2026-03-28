import { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Plus, Trash2, Search, Pencil, MapPin, 
  ArrowUpDown, ChevronLeft, ChevronRight, CheckSquare, Square, 
  Filter, LayoutGrid, LayoutList, MapPinned, Building2, Phone, Heart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getFamilies, deleteFamily, getFamily, updateFamily, createFamily } from "@/services/familiesApi";
import { getLocations } from "@/services/locationsApi";
import { getCommunities } from "@/services/communitiesApi";
import MemberFormDialog from "@/components/MemberFormDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SortConfig = {
  key: string; direction: 'asc' | 'desc' | null;
};

export default function FamiliesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Data States
  const [familiesData, setFamiliesData] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Table Config
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Form/Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [familyIdForMember, setFamilyIdForMember] = useState("");
  
  const [formState, setFormState] = useState<any>({
    name: "", father_or_husband_name: "", mobile: "", gotra: "", community: "",
    permanent_address: "", pincode: "", state: "", sambhag: "", loksabha: "", 
    district: "", vidhansabha: "", ward: ""
  });

  const [filters, setFilters] = useState({
    community: "all",
    sambhag: "all",
    loksabha: "all",
    district: "all",
    vidhansabha: "all",
    ward: "all"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const apiParams: any = {};
      if (search) apiParams.search = search;
      if (filters.community !== 'all') apiParams.community = filters.community;
      if (filters.sambhag !== 'all') apiParams.sambhag = filters.sambhag;
      if (filters.loksabha !== 'all') apiParams.loksabha = filters.loksabha;
      if (filters.district !== 'all') apiParams.district = filters.district;
      if (filters.vidhansabha !== 'all') apiParams.vidhansabha = filters.vidhansabha;
      if (filters.ward !== 'all') apiParams.ward = filters.ward;

      const [resFam, resLoc, resComm] = await Promise.all([
        getFamilies(apiParams), getLocations(), getCommunities()
      ]);
      setFamiliesData(resFam.data.results || resFam.data || []);
      setLocations(resLoc.data.results || resLoc.data || []);
      setCommunities(resComm.data.results || resComm.data || []);
    } catch (e) {
      console.error(e);
      setFamiliesData([]); // Clear stale data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    // Wait for initial locations/communities to load before triggering filtered fetch if needed
    // or just fetch everything. 
    fetchData(); 
  }, [search, filters.community, filters.district, filters.vidhansabha, filters.ward]);

  // Full Hierarchy Defaulting for Ward Volunteers
  useEffect(() => {
    if (user && locations.length > 0 && !editId && isDialogOpen && user.role === 'ward_volunteer') {
        const userLoc = locations.find(l => l.id === user.location_id);
        if (userLoc) {
            let update: any = { [userLoc.type]: userLoc.id };
            
            // Search upwards through parents
            let curr = userLoc;
            while (curr && (curr.parent || curr.parent_id)) {
                const parentId = curr.parent || curr.parent_id;
                const parent = locations.find(l => l.id === parentId);
                if (parent) {
                    update[parent.type] = parent.id;
                    curr = parent;
                } else break;
            }

            if (user.community_id) update.community = user.community_id;
            setFormState(prev => ({ ...prev, ...update }));
        }
    }
  }, [user, locations, isDialogOpen, editId]);

  // Handle Cascading Changes
  const handleLocationChange = (type: string, value: string) => {
    const freshState = { ...formState, [type]: value };
    // Reset all children
    if (type === 'state') { freshState.sambhag = ""; freshState.loksabha = ""; freshState.district = ""; freshState.vidhansabha = ""; freshState.ward = ""; }
    if (type === 'sambhag') { freshState.loksabha = ""; freshState.district = ""; freshState.vidhansabha = ""; freshState.ward = ""; }
    if (type === 'loksabha') { freshState.district = ""; freshState.vidhansabha = ""; freshState.ward = ""; }
    if (type === 'district') { freshState.vidhansabha = ""; freshState.ward = ""; }
    if (type === 'vidhansabha') { freshState.ward = ""; }
    setFormState(freshState);
  };

  const handleEditClick = async (id: string) => {
    try {
      const res = await getFamily(id);
      const f = res.data;
      setEditId(f.id);
      setFormState({
        name: f.name || "", father_or_husband_name: f.father_or_husband_name || "",
        mobile: f.mobile || "", gotra: f.gotra || "", community: f.community || "",
        permanent_address: f.permanent_address || "", pincode: f.pincode || "",
        state: f.state_id || f.state || "", 
        sambhag: f.sambhag_id || f.sambhag || "",
        loksabha: f.loksabha_id || f.loksabha || "",
        district: f.district_id || f.district || "", 
        vidhansabha: f.vidhansabha_id || f.vidhansabha || "",
        ward: f.ward_id || f.ward || ""
      });
      setIsDialogOpen(true);
    } catch (e) {}
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const isFieldLocked = (field: string) => {
    if (user?.role === 'super_admin' || editId) return false;
    if (!user?.location_id) return false;
    const userLoc = locations.find(l => l.id === user.location_id);
    if (!userLoc) return false;
    
    const tiers = ['state', 'sambhag', 'loksabha', 'district', 'vidhansabha', 'ward'];
    const userTier = tiers.indexOf(userLoc.type);
    const fieldTier = tiers.indexOf(field);
    
    // Lock field if it matches or is above the user's assigned tier
    return fieldTier >= 0 && userTier >= 0 && fieldTier <= userTier;
  };

  const filteredAndSorted = useMemo(() => {
    let items = [...familiesData];
    
    if (sortConfig.key && sortConfig.direction) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key] || ""; const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [familiesData, sortConfig]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Cascading Logic Helpers
  const states = useMemo(() => locations.filter(l => l.type === 'state'), [locations]);
  const sambhags = useMemo(() => locations.filter(l => l.type === 'sambhag' && (l.parent === formState.state || l.parent_id === formState.state)), [locations, formState.state]);
  const loksabhas = useMemo(() => locations.filter(l => l.type === 'loksabha' && (l.parent === formState.sambhag || l.parent_id === formState.sambhag)), [locations, formState.sambhag]);
  const districts = useMemo(() => locations.filter(l => l.type === 'district' && (l.parent === formState.loksabha || l.parent_id === formState.loksabha)), [locations, formState.loksabha]);
  const vidhansabhas = useMemo(() => locations.filter(l => l.type === 'vidhansabha' && (l.parent === formState.district || l.parent_id === formState.district)), [locations, formState.district]);
  const wards = useMemo(() => locations.filter(l => l.type === 'ward' && (l.parent === formState.vidhansabha || l.parent_id === formState.vidhansabha)), [locations, formState.vidhansabha]);

  const handleSaveFamily = async () => {
    try {
      if (!formState.name || !formState.mobile) { toast({ title: "नाम और मोबाइल अनिवार्य हैं", variant: "destructive" }); return; }
      if (editId) {
        await updateFamily(editId, formState); toast({ title: "परिवार अपडेट किया गया" });
      } else {
        const res = await createFamily(formState); toast({ title: "परिवार जोड़ा गया" });
        setFamilyIdForMember(res.data.id); setMemberDialogOpen(true);
      }
      setIsDialogOpen(false); fetchData();
    } catch (e) { toast({ title: "सहेजने में विफल", variant: "destructive" }); }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-slate-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> परिवार डेटाबेस (Families DB)
          </h1>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold">Manage Households Hierarchically</p>
        </div>
        <div className="flex gap-2">
           <Button size="lg" className="rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all px-8 font-heading" onClick={() => { setEditId(null); setFormState({ name: "", father_or_husband_name: "", mobile: "", gotra: "", community: "", permanent_address: "", pincode: "", state: "", sambhag: "", loksabha: "", district: "", vidhansabha: "", ward: "" }); setIsDialogOpen(true); }}>
              <Plus className="h-5 w-5 mr-2" /> नया परिवार (New Family)
           </Button>
        </div>
      </div>

      <div className="glass-card p-6 flex flex-col gap-6 bg-white/50 backdrop-blur-md border-white/40 shadow-xl rounded-3xl">
        {/* Filters Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
           {/* Search Input */}
           <div className="relative col-span-1 sm:col-span-2 lg:col-span-3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input placeholder="नाम, मोबाइल या कोड से खोजें..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-12 h-12 rounded-xl border-slate-100 bg-white shadow-inner font-bold" />
           </div>

           {/* Community Filter */}
           <Select value={filters.community} onValueChange={v => setFilters({...filters, community: v})}>
              <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-white shadow-sm font-bold"><SelectValue placeholder="समाज (Caste)" /></SelectTrigger>
              <SelectContent className="rounded-xl">
                 <SelectItem value="all">सभी समाज (All Caste)</SelectItem>
                 {communities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
           </Select>

           {/* Sambhag Filter (Primary Hierarchy Start) */}
           <Select value={filters.sambhag} onValueChange={v => setFilters({...filters, sambhag: v, loksabha: 'all', district: 'all', vidhansabha: 'all', ward: 'all'})}>
              <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-white shadow-sm font-bold"><SelectValue placeholder="संभाग" /></SelectTrigger>
              <SelectContent className="rounded-xl">
                 <SelectItem value="all">सभी संभाग</SelectItem>
                 {locations.filter(l => l.type === 'sambhag').map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
           </Select>

           {/* Actions */}
           <div className="flex gap-2">
              <Button variant="outline" className="h-12 rounded-xl border-slate-100 bg-white shadow-sm flex-1 font-black text-[10px] uppercase tracking-wider" onClick={() => setFilters({community: "all", sambhag: "all", loksabha: "all", district: "all", vidhansabha: "all", ward: "all"})}>
                 <Filter className="h-4 w-4 mr-2" /> Reset
              </Button>
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border h-12">
                <Button variant="ghost" size="icon" onClick={() => setViewMode('table')} className={`h-10 w-10 rounded-lg ${viewMode === 'table' ? 'text-primary bg-primary/10' : 'text-slate-400'}`}><LayoutList className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} className={`h-10 w-10 rounded-lg ${viewMode === 'grid' ? 'text-primary bg-primary/10' : 'text-slate-400'}`}><LayoutGrid className="h-5 w-5" /></Button>
              </div>
           </div>
        </div>

        {/* Filters Row 2 (Cascading) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100/30">
            <Select value={filters.loksabha} onValueChange={v => setFilters({...filters, loksabha: v, district: 'all', vidhansabha: 'all', ward: 'all'})} disabled={filters.sambhag === 'all' && user?.role !== 'super_admin'}>
                <SelectTrigger className="h-10 rounded-xl border-slate-100 bg-white text-xs font-bold"><SelectValue placeholder="लोकसभा" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                    <SelectItem value="all">सभी लोकसभा</SelectItem>
                    {locations.filter(l => l.type === 'loksabha' && (filters.sambhag === 'all' || l.parent === filters.sambhag || l.parent_id === filters.sambhag)).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={filters.district} onValueChange={v => setFilters({...filters, district: v, vidhansabha: 'all', ward: 'all'})} disabled={filters.loksabha === 'all' && user?.role !== 'super_admin'}>
                <SelectTrigger className="h-10 rounded-xl border-slate-100 bg-white text-xs font-bold"><SelectValue placeholder="ज़िला" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                    <SelectItem value="all">सभी ज़िले</SelectItem>
                    {locations.filter(l => l.type === 'district' && (filters.loksabha === 'all' || l.parent === filters.loksabha || l.parent_id === filters.loksabha)).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={filters.vidhansabha} onValueChange={v => setFilters({...filters, vidhansabha: v, ward: 'all'})} disabled={filters.district === 'all' && user?.role !== 'super_admin'}>
                <SelectTrigger className="h-10 rounded-xl border-slate-100 bg-white text-xs font-bold"><SelectValue placeholder="विधानसभा" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                    <SelectItem value="all">सभी विधानसभा</SelectItem>
                    {locations.filter(l => l.type === 'vidhansabha' && (filters.district === 'all' || l.parent === filters.district || l.parent_id === filters.district)).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={filters.ward} onValueChange={v => setFilters({...filters, ward: v})} disabled={filters.vidhansabha === 'all' && user?.role !== 'super_admin'}>
                <SelectTrigger className="h-10 rounded-xl border-slate-100 bg-white text-xs font-bold"><SelectValue placeholder="वार्ड" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                    <SelectItem value="all">सभी वार्ड</SelectItem>
                    {locations.filter(l => l.type === 'ward' && (filters.vidhansabha === 'all' || l.parent === filters.vidhansabha || l.parent_id === filters.vidhansabha)).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="glass-card border-none shadow-2xl rounded-3xl bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50">
                <TableHead className="w-12 py-5 px-6"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedIds(selectedIds.length === paginatedData.length ? [] : paginatedData.map(d => d.id))}>{selectedIds.length === paginatedData.length ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5" />}</Button></TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest cursor-pointer" onClick={() => handleSort('family_code')}>कोड</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest">मुखिया का नाम</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest">मोबाइल</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest">वार्ड / विधानसभा</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">सदस्य</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-right pr-10">कार्रवाई</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow><TableCell colSpan={7} className="text-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" /></TableCell></TableRow>
              ) : paginatedData.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={7} className="text-center py-32 bg-slate-50/20">
                      <div className="flex flex-col items-center gap-4 text-slate-300">
                         <div className="p-4 bg-white rounded-full shadow-sm shadow-slate-100 ring-1 ring-slate-100"><Search className="h-10 w-10" /></div>
                         <p className="text-sm font-black uppercase tracking-widest">No households found matching your search</p>
                         <Button variant="link" className="text-primary font-bold text-xs" onClick={() => { setSearch(""); setFilters({community: "all", sambhag: "all", loksabha: "all", district: "all", vidhansabha: "all", ward: "all"}); }}>Reset all filters</Button>
                      </div>
                   </TableCell>
                 </TableRow>
              ) : paginatedData.map((f: any) => (
                 <TableRow key={f.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="px-6 py-4"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSelectOne(f.id)}>{selectedIds.includes(f.id) ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5" />}</Button></TableCell>
                    <TableCell><span className="font-mono text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded">{f.family_code}</span></TableCell>
                    <TableCell className="font-bold text-slate-800">{f.name}</TableCell>
                    <TableCell className="text-slate-500">{f.mobile}</TableCell>
                    <TableCell>
                        <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-700">{f.ward_name || "N/A"}</p>
                            <p className="text-[9px] uppercase text-slate-400 font-black tracking-tighter">{f.vidhansabha_name || f.district_name || "Region Unknown"}</p>
                        </div>
                    </TableCell>
                    <TableCell className="text-center"><Badge variant="secondary" className="rounded-xl px-3 py-1 bg-slate-100 text-slate-700 font-black">{f.members_count || 0}</Badge></TableCell>
                    <TableCell className="text-right pr-6">
                       <div className="flex justify-end gap-2 text-primary">
                          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleEditClick(f.id)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => { if(confirm("हटाएं?")) deleteFamily(f.id).then(fetchData); }}><Trash2 className="h-4 w-4" /></Button>
                       </div>
                    </TableCell>
                 </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="p-6 bg-slate-50/50 border-t flex items-center justify-between">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total <span className="text-slate-900">{filteredAndSorted.length}</span> Households</p>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="rounded-lg h-10 w-10"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages || totalPages === 0} className="rounded-lg h-10 w-10"><ChevronRight className="h-4 w-4" /></Button>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {paginatedData.map((f: any) => (
              <div key={f.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 group relative transition-all">
                 <h3 className="text-2xl font-black text-slate-900 mb-2">{f.name}</h3>
                 <p className="text-slate-400 font-bold text-sm mb-6">{f.mobile}</p>
                 <div className="flex items-center gap-6 pt-6 border-t border-slate-100">
                    <div className="flex flex-col"><span className="text-[10px] uppercase font-black text-slate-400 mb-1">Members</span><span className="text-lg font-black text-slate-800">{f.members_count || 0}</span></div>
                    <div className="flex flex-col"><span className="text-[10px] uppercase font-black text-slate-400 mb-1">Area</span><span className="text-sm font-black text-slate-600 truncate max-w-[100px]">{f.ward_name || f.district_name || "N/A"}</span></div>
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* Main Family Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl p-0 h-[92vh] flex flex-col border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
             <DialogHeader className="p-8 bg-primary text-primary-foreground flex-none shadow-lg">
                <DialogTitle className="text-3xl font-black font-heading flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-2xl"><Building2 className="h-8 w-8" /></div>
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] opacity-80 font-black">Household Registration</p>
                        <span>{editId ? "विवरण संशोधित करें" : "नया परिवार पंजीकृत करें"}</span>
                    </div>
                </DialogTitle>
             </DialogHeader>

             <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc] p-8 space-y-12">
                {/* 1. Basic Info */}
                <section className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 space-y-8">
                    <h3 className="text-base font-black uppercase tracking-widest text-slate-800 flex items-center gap-3 border-b pb-4">
                       <div className="p-2 bg-pink-50 text-pink-500 rounded-xl"><Heart className="h-5 w-5 fill-pink-500" /></div>
                       1. व्यक्तिगत विवरण (Personal Details)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2 md:col-span-2">
                          <Label className="text-slate-600 font-black text-xs uppercase ml-1">पूरा नाम (Full Name) *</Label>
                          <Input value={formState.name} onChange={e=>setFormState({...formState, name: e.target.value})} className="h-14 rounded-2xl border-slate-200 text-lg font-bold" placeholder="मुखिया का नाम" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-slate-600 font-black text-xs uppercase ml-1">मोबाइल नंबर *</Label>
                          <Input value={formState.mobile} onChange={e=>setFormState({...formState, mobile: e.target.value})} className="h-14 rounded-2xl border-slate-200" placeholder="10 अंकों का नंबर" maxLength={10} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-slate-600 font-black text-xs uppercase ml-1">समाज/समुदाय (Caste)</Label>
                          <Select value={formState.community} onValueChange={v => setFormState({...formState, community: v})} disabled={user?.role === 'ward_volunteer'}>
                             <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-bold"><SelectValue placeholder="समाज चुनें" /></SelectTrigger>
                             <SelectContent className="rounded-2xl shadow-2x">
                                {communities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                             </SelectContent>
                          </Select>
                       </div>
                    </div>
                </section>

                {/* 2. Cascading Locations */}
                <section className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 space-y-8">
                    <h3 className="text-base font-black uppercase tracking-widest text-slate-800 flex items-center gap-3 border-b pb-4">
                       <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl"><MapPin className="h-5 w-5" /></div>
                       2. भौगोलिक विवरण (Geographic Hierarchy)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label className="text-slate-600 font-black text-xs uppercase ml-1">राज्य (State)</Label>
                          <Select value={formState.state} onValueChange={v => handleLocationChange('state', v)} disabled={isFieldLocked('state')}>
                             <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="राज्य चुनें" /></SelectTrigger>
                             <SelectContent className="rounded-xl">{states.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-slate-600 font-black text-xs uppercase ml-1">संभाग (Sambhag)</Label>
                          <Select value={formState.sambhag} onValueChange={v => handleLocationChange('sambhag', v)} disabled={isFieldLocked('sambhag') || (!formState.state && !isFieldLocked('sambhag'))}>
                             <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="संभाग चुनें" /></SelectTrigger>
                             <SelectContent className="rounded-xl">{sambhags.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-slate-600 font-black text-xs uppercase ml-1">लोकसभा (Loksabha)</Label>
                          <Select value={formState.loksabha} onValueChange={v => handleLocationChange('loksabha', v)} disabled={isFieldLocked('loksabha') || (!formState.sambhag && !isFieldLocked('loksabha'))}>
                             <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="लोकसभा चुनें" /></SelectTrigger>
                             <SelectContent className="rounded-xl">{loksabhas.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-slate-600 font-black text-xs uppercase ml-1">ज़िला (District)</Label>
                          <Select value={formState.district} onValueChange={v => handleLocationChange('district', v)} disabled={isFieldLocked('district') || (!formState.loksabha && !isFieldLocked('district'))}>
                             <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="ज़िला चुनें" /></SelectTrigger>
                             <SelectContent className="rounded-xl">{districts.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-slate-600 font-black text-xs uppercase ml-1">विधानसभा (Constituency)</Label>
                          <Select value={formState.vidhansabha} onValueChange={v => handleLocationChange('vidhansabha', v)} disabled={isFieldLocked('vidhansabha') || (!formState.district && !isFieldLocked('vidhansabha'))}>
                             <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="विधानसभा चुनें" /></SelectTrigger>
                             <SelectContent className="rounded-xl">{vidhansabhas.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-slate-600 font-black text-xs uppercase ml-1">वार्ड (Ward)</Label>
                          <Select value={formState.ward} onValueChange={v => handleLocationChange('ward', v)} disabled={isFieldLocked('ward') || (!formState.vidhansabha && !isFieldLocked('ward'))}>
                             <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="वार्ड चुनें" /></SelectTrigger>
                             <SelectContent className="rounded-xl">{wards.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                       <div className="md:col-span-2 space-y-2">
                          <Label className="text-slate-600 font-black text-xs uppercase ml-1">स्थायी पता (Full Address)</Label>
                          <Textarea value={formState.permanent_address} onChange={e=>setFormState({...formState, permanent_address: e.target.value})} className="h-20 rounded-2xl resize-none" placeholder="मकान नं, गली..." />
                       </div>
                    </div>
                </section>
             </div>

             <footer className="p-8 bg-white border-t flex flex-col sm:flex-row gap-4 flex-none">
                <Button variant="ghost" className="flex-1 h-14 rounded-2xl text-slate-400 font-black" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="flex-[2] h-14 rounded-2xl text-lg font-black shadow-lg" onClick={handleSaveFamily}>
                   {editId ? "अपडेट करें" : "सहेजें एवं आगे बढ़ें"}
                </Button>
             </footer>
          </DialogContent>
      </Dialog>

      <MemberFormDialog 
        isOpen={memberDialogOpen} 
        onClose={() => setMemberDialogOpen(false)} 
        familyId={familyIdForMember} 
        onSuccess={fetchData} 
      />
    </div>
  );
}
