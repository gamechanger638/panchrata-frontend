import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Users, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getFamilies, createFamily, deleteFamily } from "@/services/familiesApi";
import { getLocations } from "@/services/locationsApi";
import { getCommunities } from "@/services/communitiesApi";

export default function FamiliesPage() {
  const { user } = useAuth();
  const [familiesData, setFamiliesData] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Add Family Form State
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gotra, setGotra] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [address, setAddress] = useState("");
  const [stateId, setStateId] = useState("");
  const [sambhagId, setSambhagId] = useState("");
  const [loksabhaId, setLoksabhaId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [vidhansabhaId, setVidhansabhaId] = useState("");
  const [wardId, setWardId] = useState("");
  
  const [members, setMembers] = useState<any[]>([
    { name: '', relation: '', dob: '', education: '', profession: '', marital_status: 'unmarried', mobile: '' }
  ]);

  const addMemberRow = () => {
    setMembers([...members, { name: '', relation: '', dob: '', education: '', profession: '', marital_status: 'unmarried', mobile: '' }]);
  };

  const removeMemberRow = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: string, value: string) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };
  
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resFam, resLoc, resComm] = await Promise.all([
        getFamilies(search),
        getLocations(),
        getCommunities()
      ]);
      setFamiliesData(resFam.data.results || resFam.data || []);
      setLocations(resLoc.data.results || resLoc.data || []);
      setCommunities(resComm.data.results || resComm.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]); // Re-fetch on search change

  // Pre-fill and lock dropdowns based on user's assigned scope
  useEffect(() => {
     if (user && user.role !== 'super_admin' && locations.length > 0) {
         let current = locations.find(l => l.id === user.location_id);
         let newState="", newSambhag="", newLoksabha="", newDist="", newVid="", newWard="";
         while(current) {
             if(current.type === 'state') newState = current.id;
             if(current.type === 'sambhag') newSambhag = current.id;
             if(current.type === 'loksabha') newLoksabha = current.id;
             if(current.type === 'district') newDist = current.id;
             if(current.type === 'vidhansabha') newVid = current.id;
             if(current.type === 'ward') newWard = current.id;
             current = locations.find(l => l.id === current.parent);
         }
         if (newState && !stateId) setStateId(newState);
         if (newSambhag && !sambhagId) setSambhagId(newSambhag);
         if (newLoksabha && !loksabhaId) setLoksabhaId(newLoksabha);
         if (newDist && !districtId) setDistrictId(newDist);
         if (newVid && !vidhansabhaId) setVidhansabhaId(newVid);
         if (newWard && !wardId) setWardId(newWard);

         if (user.community_id && !communityId) {
             setCommunityId(user.community_id);
         }
     }
  }, [user, locations, isOpen]);

  const canChangeLevel = (level: 'state' | 'sambhag' | 'loksabha' | 'district' | 'vidhansabha' | 'ward') => {
    if (user?.role === 'super_admin') return true;
    const userLoc = locations.find(l => l.id === user?.location_id);
    if (!userLoc) return true;
    
    // Ordered hierarchy from highest to lowest
    const levels = ['state', 'sambhag', 'loksabha', 'zone', 'district', 'vidhansabha', 'ward'];
    const userLevelIndex = levels.indexOf(userLoc.type);
    const currentLevelIndex = levels.indexOf(level);
 
    if (userLevelIndex === -1) return true;
    if (currentLevelIndex <= userLevelIndex) return false;
    return true; 
  };

  const handleAddFamily = async () => {
    try {
      const payload = { 
        name, 
        mobile, 
        gotra, 
        community: communityId === 'none' ? null : communityId, 
        permanent_address: address, 
        state: stateId || null, 
        sambhag: sambhagId || null,
        loksabha: loksabhaId || null,
        district: districtId || null, 
        vidhansabha: vidhansabhaId || null, 
        ward: wardId || null, 
        members: members.filter(m => m.name.trim() !== "")
      };
      
      await createFamily(payload);

      toast({ title: "परिवार सफलतापूर्वक जोड़ा गया" });
      setIsOpen(false);
      fetchData();
      
      // Reset loosely
      setName(""); setMobile(""); setGotra(""); setAddress("");
      setMembers([{ name: '', relation: '', dob: '', education: '', profession: '', marital_status: 'unmarried', mobile: '' }]);
      if (canChangeLevel('state')) setStateId("");
      if (canChangeLevel('sambhag')) setSambhagId("");
      if (canChangeLevel('loksabha')) setLoksabhaId("");
      if (canChangeLevel('district')) setDistrictId("");
      if (canChangeLevel('vidhansabha')) setVidhansabhaId("");
      if (canChangeLevel('ward')) setWardId("");
      if (user?.role === 'super_admin' || !user?.community_id) setCommunityId("");

    } catch (e: any) {
      const msg = e.response?.data ? JSON.stringify(e.response.data) : e.message;
      toast({ title: "त्रुटि (Error)", description: msg, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("क्या आप सुनिश्चित हैं कि आप इसे हटाना चाहते हैं?")) return;
    try {
      await deleteFamily(id);
      toast({ title: "परिवार हटा दिया गया है" });
      fetchData();
    } catch (e) {}
  };

  const renderLocations = (arr: any[], currentId: string, level: 'state'|'sambhag'|'loksabha'|'district'|'vidhansabha'|'ward') => {
      if (!canChangeLevel(level) && currentId) {
          return arr.filter(l => l.id === currentId);
      }
      return arr;
  };

  const states = renderLocations(locations.filter(l => l.type === 'state'), stateId, 'state');
  const sambhags = renderLocations(locations.filter(l => l.type === 'sambhag' && (!stateId || l.parent === stateId)), sambhagId, 'sambhag');
  const loksabhas = renderLocations(locations.filter(l => l.type === 'loksabha' && (!sambhagId || l.parent === sambhagId)), loksabhaId, 'loksabha');
  const districts = renderLocations(locations.filter(l => l.type === 'district' && (!loksabhaId || l.parent === loksabhaId)), districtId, 'district');
  const vidhansabhas = renderLocations(locations.filter(l => l.type === 'vidhansabha'), vidhansabhaId, 'vidhansabha');
  const wards = renderLocations(locations.filter(l => l.type === 'ward' && (!vidhansabhaId || l.parent === vidhansabhaId)), wardId, 'ward');
  
  const selectableCommunities = (user?.role !== 'super_admin' && !!user?.community_id) 
      ? communities.filter(c => c.id === user.community_id)
      : communities;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">परिवार सूची (Families)</h1>
          <p className="text-sm text-muted-foreground mt-1">अपने क्षेत्र के परिवारों का विवरण और प्रबंधन करें</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> नया परिवार जोड़ें</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[90vw]">
            <DialogHeader><DialogTitle className="font-heading border-b pb-2">नया परिवार और सदस्य विवरण दर्ज करें</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-5 py-4">
              <div className="col-span-2"><Label>परिवार के मुखिया का नाम <span className="text-red-500">*</span></Label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="मुखिया का पूरा नाम दर्ज करें" className="mt-1" /></div>
              <div><Label>मोबाइल नंबर (Mobile)</Label><Input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="10-अंकीय मोबाइल नंबर" className="mt-1" /></div>
              <div><Label>गोत्र (Gotra)</Label><Input value={gotra} onChange={e=>setGotra(e.target.value)} placeholder="गोत्र दर्ज करें" className="mt-1" /></div>
              
              <div className="col-span-2">
                <Label>समुदाय / जाति (Community)</Label>
                <Select value={communityId} onValueChange={setCommunityId} disabled={user?.role !== 'super_admin' && !!user?.community_id}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="समुदाय चुनें" /></SelectTrigger>
                  <SelectContent>
                    {user?.role === 'super_admin' && <SelectItem value="none" className="text-muted-foreground italic">कोई नहीं (None)</SelectItem>}
                    {selectableCommunities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2"><Label>पक्का पता (Address)</Label><Input value={address} onChange={e=>setAddress(e.target.value)} placeholder="मकान नंबर, गली या गांव का पूरा पता..." className="mt-1" /></div>
              
              <div className="p-4 bg-muted/40 rounded-xl space-y-4 border border-border/50 shadow-inner col-span-2">
                <p className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-1.5 mb-2">भौगोलिक क्षेत्र विवरण</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>राज्य (State)</Label>
                    <Select value={stateId} onValueChange={setStateId} disabled={!canChangeLevel('state')}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="राज्य चुनें" /></SelectTrigger>
                      <SelectContent>
                        {states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>संभाग (Sambhag)</Label>
                    <Select value={sambhagId} onValueChange={setSambhagId} disabled={!canChangeLevel('sambhag') || !stateId}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="संभाग चुनें" /></SelectTrigger>
                      <SelectContent>
                        {sambhags.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>लोकसभा (Loksabha)</Label>
                    <Select value={loksabhaId} onValueChange={setLoksabhaId} disabled={!canChangeLevel('loksabha') || !sambhagId}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="लोकसभा चुनें" /></SelectTrigger>
                      <SelectContent>
                        {loksabhas.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>ज़िला (District)</Label>
                    <Select value={districtId} onValueChange={setDistrictId} disabled={!canChangeLevel('district') || !loksabhaId}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="ज़िला चुनें" /></SelectTrigger>
                      <SelectContent>
                        {districts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>विधानसभा (Vidhansabha)</Label>
                    <Select value={vidhansabhaId} onValueChange={setVidhansabhaId} disabled={!canChangeLevel('vidhansabha')}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="विधानसभा चुनें" /></SelectTrigger>
                      <SelectContent>
                        {vidhansabhas.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>वार्ड नंबर / गांव (Ward / Village)</Label>
                    <Select value={wardId} onValueChange={setWardId} disabled={!canChangeLevel('ward') || !vidhansabhaId}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="वार्ड चुनें" /></SelectTrigger>
                      <SelectContent>
                        {wards.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="col-span-2 mt-4 p-4 bg-muted/20 rounded-xl border border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <p className="font-bold text-primary flex items-center gap-1.5">परिवार के सदस्य (Family Members)</p>
                  <Button variant="outline" size="sm" onClick={addMemberRow} className="h-8"><Plus className="h-4 w-4 mr-1"/> सदस्य जोड़ें</Button>
                </div>
                
                <div className="space-y-3">
                  {members.map((m, index) => (
                    <div key={index} className="flex gap-3 items-start border p-3 rounded-lg bg-background">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        <div className="col-span-2 lg:col-span-1">
                           <Label className="text-xs">नाम *</Label>
                           <Input className="h-8 text-sm mt-1" value={m.name} onChange={e => updateMember(index, 'name', e.target.value)} placeholder="नाम" />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                           <Label className="text-xs">रिश्ता</Label>
                           <Input className="h-8 text-sm mt-1" value={m.relation} onChange={e => updateMember(index, 'relation', e.target.value)} placeholder="रिश्ता" />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                           <Label className="text-xs">जन्म तिथि</Label>
                           <Input type="date" className="h-8 text-sm mt-1 text-muted-foreground w-full" value={m.dob} onChange={e => updateMember(index, 'dob', e.target.value)} />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                           <Label className="text-xs">शिक्षा</Label>
                           <Input className="h-8 text-sm mt-1" value={m.education} onChange={e => updateMember(index, 'education', e.target.value)} placeholder="शिक्षा" />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                           <Label className="text-xs">व्यवसाय</Label>
                           <Input className="h-8 text-sm mt-1" value={m.profession} onChange={e => updateMember(index, 'profession', e.target.value)} placeholder="व्यवसाय" />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                           <Label className="text-xs">वैवाहिक स्थिति</Label>
                           <Select value={m.marital_status} onValueChange={v => updateMember(index, 'marital_status', v)}>
                             <SelectTrigger className="h-8 mt-1 text-sm"><SelectValue /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="unmarried">अविवाहित</SelectItem>
                               <SelectItem value="married">विवाहित</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                           <Label className="text-xs">मोबाइल</Label>
                           <Input className="h-8 text-sm mt-1" value={m.mobile} onChange={e => updateMember(index, 'mobile', e.target.value)} placeholder="मोबाइल" />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive mt-6 self-start shrink-0" onClick={() => removeMemberRow(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 mt-2"><Button className="w-full" size="lg" onClick={handleAddFamily} disabled={!communityId || !name}>परिवार व सदस्य सहेजें (Save)</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="परिवार के मुखिया का नाम या मोबाइल नंबर से खोजें..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-bold">परिवार कोड</TableHead>
              <TableHead className="font-bold">मुखिया का नाम</TableHead>
              <TableHead className="hidden md:table-cell font-bold">मोबाइल</TableHead>
              <TableHead className="font-bold">समुदाय (Caste)</TableHead>
              <TableHead className="font-bold">क्षेत्र (Location)</TableHead>
              <TableHead className="hidden sm:table-cell font-bold">कुल सदस्य</TableHead>
              <TableHead className="font-bold">कार्रवाई</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">डेटा लोड हो रहा है (Loading)...</TableCell></TableRow>
            ) : familiesData.length === 0 ? (
               <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">इस क्षेत्र में कोई परिवार नहीं मिला।</TableCell></TableRow>
            ) : (
             familiesData.map((f: any) => (
              <TableRow key={f.id} className="hover:bg-muted/10">
                <TableCell className="font-medium text-xs font-mono">{f.family_code}</TableCell>
                <TableCell className="font-semibold text-primary">{f.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{f.mobile}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs bg-background">{f.community || "कोई नहीं"}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate" title={[f.ward, f.vidhansabha, f.district, f.loksabha, f.sambhag, f.state].filter(Boolean).join(', ')}>
                   {[f.ward, f.vidhansabha, f.district, f.loksabha, f.sambhag].filter(Boolean).join(', ')}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="flex items-center gap-1.5 text-sm font-medium"><Users className="h-3.5 w-3.5 text-muted-foreground" />{f.members_count || 0}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user?.role === 'super_admin' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(f.id)} title="हटाएं (Delete)">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
             ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
