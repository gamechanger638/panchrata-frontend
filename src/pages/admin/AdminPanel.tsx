import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Shield, Users, MapPin, Building2, Plus, Pencil, Trash2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getUsers, createUser, updateUser, deleteUser } from '@/services/usersApi';
import { getLocations, createLocation, updateLocation, deleteLocation } from '@/services/locationsApi';
import { getCommunities, createCommunity } from '@/services/communitiesApi';

interface AdminStats {
    totalUsers: number;
    totalCommunities: number;
    totalLocations: number;
    pendingRequests: number;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  
  // Dashboard-like stats
  const [stats, setStats] = useState<AdminStats>({
      totalUsers: 0,
      totalCommunities: 0,
      totalLocations: 0,
      pendingRequests: 0
  });

  // User form states
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("ward_volunteer");
  const [userCommunity, setUserCommunity] = useState("");
  
  // Cascading Location States for Users
  const [locHierarchy, setLocHierarchy] = useState({
      state: "",
      sambhag: "",
      loksabha: "",
      district: "",
      zone: "",
      vidhansabha: "",
      ward: ""
  });

  const handleLocChange = (level: string, id: string) => {
      setLocHierarchy(prev => {
          const next = { ...prev, [level]: id };
          if (level === 'state') { next.sambhag = ""; next.loksabha = ""; next.district = ""; next.zone = ""; next.vidhansabha = ""; next.ward = ""; }
          if (level === 'sambhag') { next.loksabha = ""; next.district = ""; next.zone = ""; next.vidhansabha = ""; next.ward = ""; }
          if (level === 'loksabha') { next.district = ""; next.zone = ""; next.vidhansabha = ""; next.ward = ""; }
          if (level === 'district') { next.zone = ""; next.vidhansabha = ""; next.ward = ""; }
          if (level === 'vidhansabha' || level === 'zone') { next.ward = ""; }
          return next;
      });
  };

  // Location form states
  const [isLocOpen, setIsLocOpen] = useState(false);
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [locName, setLocName] = useState("");
  const [locType, setLocType] = useState("state");
  const [locProps, setLocProps] = useState({ state: "", sambhag: "", loksabha: "", district: "", vidhansabha: "" });

  const handleLocParentChange = (level: string, id: string) => {
     setLocProps(prev => {
         const next = { ...prev, [level]: id };
         if (level === 'state') { next.sambhag = ""; next.loksabha = ""; next.district = ""; next.vidhansabha = ""; }
         if (level === 'sambhag') { next.loksabha = ""; next.district = ""; next.vidhansabha = ""; }
         if (level === 'loksabha') { next.district = ""; next.vidhansabha = ""; }
         if (level === 'district') { next.vidhansabha = ""; }
         return next;
     });
  };

  const finalLocParent = 
      locType === 'sambhag' ? locProps.state :
      locType === 'loksabha' ? locProps.sambhag :
      locType === 'district' ? locProps.loksabha :
      (locType === 'vidhansabha' || locType === 'zone') ? locProps.district :
      locType === 'ward' ? locProps.vidhansabha : null;

  // Community form states
  const [isCommOpen, setIsCommOpen] = useState(false);
  const [commName, setCommName] = useState("");
  const [commDesc, setCommDesc] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, lRes, cRes] = await Promise.all([
        getUsers(),
        getLocations(),
        getCommunities()
      ]);
      const usersData = uRes.data.results || uRes.data || [];
      const locsData = lRes.data.results || lRes.data || [];
      const commsData = cRes.data.results || cRes.data || [];
      
      setUsers(usersData);
      setLocations(locsData);
      setCommunities(commsData);
      
      setStats({
          totalUsers: usersData.length,
          totalCommunities: commsData.length,
          totalLocations: locsData.length,
          pendingRequests: 0
      });
    } catch (e) {
      toast({ title: "त्रुटि (Error)", description: "डेटा लाने में विफल (Failed to fetch data)", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async () => {
    try {
        let finalUserLocation = null;
        if (userRole === 'state_admin') finalUserLocation = locHierarchy.state;
        if (userRole === 'district_admin') finalUserLocation = locHierarchy.district;
        if (userRole === 'zone_admin') finalUserLocation = locHierarchy.zone;
        if (userRole === 'vidhansabha_admin') finalUserLocation = locHierarchy.vidhansabha;
        if (userRole === 'ward_volunteer') finalUserLocation = locHierarchy.ward;

        if (userRole !== 'super_admin' && !finalUserLocation) {
             toast({ title: "त्रुटि (Error)", description: "कृपया इस भूमिका के लिए भौगोलिक क्षेत्र पूरी तरह से चुनें।", variant: "destructive" });
             return;
        }

        const payload: any = {
            name: userName,
            email: userEmail,
            role: userRole,
            community: userCommunity && userCommunity !== 'all' ? userCommunity : null,
            location: finalUserLocation
        };
        
        if (userPassword) {
            payload.password = userPassword;
        }

        if (editingUserId) {
             await updateUser(editingUserId, payload);
             toast({ title: "सफल (Success)", description: "खाता सफलतापूर्वक अपडेट किया गया है" });
        } else {
             await createUser(payload);
             toast({ title: "सफल (Success)", description: "खाता सफलतापूर्वक बना लिया गया है" });
        }
        setIsUserOpen(false);
        fetchData();
        clearUserForm();
    } catch (e: any) {
        toast({ title: "त्रुटि (Error)", description: e.response?.data?.email?.[0] || "उपयोगकर्ता सहेजने में विफल", variant: "destructive" });
    }
  };

  const handleEditUserClick = (u: any) => {
     setEditingUserId(u.id);
     setUserName(u.name);
     setUserEmail(u.email);
     setUserRole(u.role);
     setUserCommunity(u.community || "all");
     setUserPassword("");
     
     let currState="", currSambhag="", currLoksabha="", currDistrict="", currZone="", currVid="", currWard="";
     if (u.location) {
         let p = locations.find(l => l.id === u.location);
         while (p) {
             if (p.type === 'state') currState = p.id;
             if (p.type === 'sambhag') currSambhag = p.id;
             if (p.type === 'loksabha') currLoksabha = p.id;
             if (p.type === 'district') currDistrict = p.id;
             if (p.type === 'zone') currZone = p.id;
             if (p.type === 'vidhansabha') currVid = p.id;
             if (p.type === 'ward') currWard = p.id;
             p = locations.find(l => l.id === p.parent);
         }
     }
     setLocHierarchy({ state: currState, sambhag: currSambhag, loksabha: currLoksabha, district: currDistrict, zone: currZone, vidhansabha: currVid, ward: currWard });
     setIsUserOpen(true);
  };

  const handleDeleteUserClick = async (id: string) => {
     if(!confirm('क्या आप सुनिश्चित हैं कि आप इस उपयोगकर्ता को हटाना चाहते हैं?')) return;
     try {
         await deleteUser(id);
         toast({ title: "सफल", description: "उपयोगकर्ता हटा दिया गया" });
         fetchData();
     } catch (e) {
         toast({ title: "त्रुटि (Error)", description: "उपयोगकर्ता हटाने में विफल", variant: "destructive" });
     }
  };

  const clearUserForm = () => {
      setUserName(""); setUserEmail(""); setUserPassword(""); setUserRole("ward_volunteer");
      setUserCommunity(""); setLocHierarchy({state:"", sambhag:"", loksabha:"", district:"", zone:"", vidhansabha:"", ward:""});
      setEditingUserId(null);
  };

  const handleCreateLocation = async () => {
     try {
         const payload = { name: locName, type: locType, parent: finalLocParent || null };
         if (editingLocId) {
             await updateLocation(editingLocId, payload);
             toast({ title: "सफल (Success)", description: "स्थान सफलतापूर्वक अपडेट किया गया है" });
         } else {
             await createLocation(payload);
             toast({ title: "सफल (Success)", description: "स्थान सफलतापूर्वक बनाया गया है" });
         }
         setIsLocOpen(false);
         fetchData();
         setLocName(""); setLocProps({state:"", sambhag:"", loksabha:"", district:"", vidhansabha:""});
         setEditingLocId(null);
     } catch (e: any) {
         console.error("Location save error:", e.response?.data);
         const errorMsg = e.response?.data?.parent?.[0] || e.response?.data?.name?.[0] || e.response?.data?.detail || "स्थान सहेजने में विफल";
         toast({ title: "त्रुटि (Error)", description: String(errorMsg), variant: "destructive" });
     }
  };

  const handleEditLocClick = (loc: any) => {
     setEditingLocId(loc.id);
     setLocName(loc.name);
     setLocType(loc.type);
     
     let currState="", currSambhag="", currLoksabha="", currDistrict="", currVid="";
     if (loc.parent) {
         let p = locations.find(l => l.id === loc.parent);
         while (p) {
             if (p.type === 'state') currState = p.id;
             if (p.type === 'sambhag') currSambhag = p.id;
             if (p.type === 'loksabha') currLoksabha = p.id;
             if (p.type === 'district') currDistrict = p.id;
             if (p.type === 'vidhansabha') currVid = p.id;
             p = locations.find(l => l.id === p.parent);
         }
     }
     setLocProps({ state: currState, sambhag: currSambhag, loksabha: currLoksabha, district: currDistrict, vidhansabha: currVid });
     setIsLocOpen(true);
  };

  const handleDeleteLocClick = async (id: string) => {
     if(!confirm('क्या आप सुनिश्चित हैं कि आप इस स्थान को हटाना चाहते हैं?')) return;
     try {
         await deleteLocation(id);
         toast({ title: "सफल", description: "स्थान हटा दिया गया" });
         fetchData();
     } catch (e) {
         toast({ title: "त्रुटि (Error)", description: "स्थान हटाने में विफल", variant: "destructive" });
     }
  };

  const handleCreateCommunity = async () => {
      try {
          await createCommunity({ name: commName, description: commDesc });
          toast({ title: "सफल (Success)", description: "समुदाय सफलतापूर्वक बनाया गया है" });
          setIsCommOpen(false);
          fetchData();
          setCommName(""); setCommDesc("");
      } catch (e) {
          toast({ title: "त्रुटि (Error)", description: "समुदाय बनाने में विफल", variant: "destructive" });
      }
  };

  if (loading && !users.length) {
      return (
          <div className="flex items-center justify-center p-8 h-[60vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
      );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-foreground">एडमिन कार्यक्षेत्र (Admin Workspace)</h1>
        <p className="text-muted-foreground">सुपर एडमिन केंद्रीय नियंत्रण — बुनियादी ढांचा और उपयोगकर्ता प्रबंधन (Infrastructure & User Management)</p>
      </div>

      <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatDisplay title="कुल उपयोगकर्ता" value={stats.totalUsers} icon={Users} color="text-primary" />
              <StatDisplay title="समुदाय (Communities)" value={stats.totalCommunities} icon={Building2} color="text-secondary" />
              <StatDisplay title="चिह्नित क्षेत्र (Mapped Areas)" value={stats.totalLocations} icon={MapPin} color="text-accent" />
              <StatDisplay title="सुरक्षा स्तर" value="उच्च (High)" icon={Shield} color="text-green-600" />
          </div>
      </section>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-muted px-1.5 py-1 rounded-xl">
          <TabsTrigger value="users" className="gap-2 px-6"><Users className="h-4 w-4" /> उपयोगकर्ता (Users)</TabsTrigger>
          {user?.role === 'super_admin' && <TabsTrigger value="communities" className="gap-2 px-6"><Building2 className="h-4 w-4" /> समुदाय (Communities)</TabsTrigger>}
          {user?.role === 'super_admin' && <TabsTrigger value="locations" className="gap-2 px-6"><MapPin className="h-4 w-4" /> स्थान (Locations)</TabsTrigger>}
        </TabsList>

        <TabsContent value="users" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-bold">खाते प्रबंधित करें (Manage Accounts)</h2>
                <Dialog open={isUserOpen} onOpenChange={(open) => { setIsUserOpen(open); if(!open) clearUserForm(); }}>
                    <DialogTrigger asChild>
                        <Button onClick={clearUserForm} className="gap-2"><Plus className="h-4 w-4" /> नया उपयोगकर्ता जोड़ें</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle className="font-heading">{editingUserId ? "खाता अपडेट करें (Update Account)" : "नया खाता बनाएं (New Account)"}</DialogTitle></DialogHeader>
                        <div className="grid gap-5 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><Label>पूरा नाम (Full Name)</Label><Input value={userName} onChange={e=>setUserName(e.target.value)} placeholder="जैसे: राहुल शर्मा" className="mt-1" /></div>
                                <div className="space-y-1.5"><Label>ईमेल आईडी (Email)</Label><Input type="email" value={userEmail} onChange={e=>setUserEmail(e.target.value)} placeholder="rahul@example.com" className="mt-1" /></div>
                            </div>
                            <div className="space-y-1.5"><Label>पासवर्ड (Password) {editingUserId && <span className="text-xs text-muted-foreground font-normal">(यदि बदलना हो तभी भरें)</span>}</Label><Input type="password" value={userPassword} onChange={e=>setUserPassword(e.target.value)} placeholder={editingUserId ? "नया पासवर्ड..." : "कम से कम 8 अक्षर"} className="mt-1" /></div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>भूमिका स्तर (Role Level)</Label>
                                    <Select value={userRole} onValueChange={(v) => { setUserRole(v); setLocHierarchy({state:"", sambhag:"", loksabha:"", district:"", zone:"", vidhansabha:"", ward:""}); }}>
                                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {user?.role === 'super_admin' && <SelectItem value="super_admin">सुपर एडमिन (Super Admin)</SelectItem>}
                                            {['super_admin'].includes(user?.role || '') && <SelectItem value="state_admin">राज्य एडमिन (State Admin)</SelectItem>}
                                            {['super_admin', 'state_admin'].includes(user?.role || '') && <SelectItem value="district_admin">ज़िला एडमिन (District Admin)</SelectItem>}
                                            {['super_admin', 'state_admin', 'district_admin'].includes(user?.role || '') && <SelectItem value="zone_admin">ज़ोन एडमिन (Zone Admin)</SelectItem>}
                                            {['super_admin', 'state_admin', 'district_admin'].includes(user?.role || '') && <SelectItem value="vidhansabha_admin">विधानसभा एडमिन (Vidhansabha Admin)</SelectItem>}
                                            <SelectItem value="ward_volunteer">वार्ड स्वयंसेवक (Ward Volunteer)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>समुदाय अधिकार क्षेत्र (Community Scope)</Label>
                                    <Select value={userCommunity} onValueChange={setUserCommunity}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="समुदाय चुनें" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">वैश्विक - सभी समुदाय (Global)</SelectItem>
                                            {communities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            {userRole !== 'super_admin' && (
                               <div className="p-4 bg-muted/40 rounded-xl space-y-4 border border-border/50 shadow-inner">
                                   <p className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
                                      <MapPin className="h-3 w-3" /> भौगोलिक जिम्मेदारी (Geographic Responsibility)
                                   </p>
                                   
                                   <div className="space-y-1.5">
                                      <Label>राज्य (State)</Label>
                                      <Select value={locHierarchy.state} onValueChange={v => handleLocChange('state', v)}>
                                          <SelectTrigger><SelectValue placeholder="राज्य चुनें..." /></SelectTrigger>
                                          <SelectContent>{locations.filter(l => l.type === 'state').map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                      </Select>
                                   </div>

                                   {['district_admin', 'zone_admin', 'vidhansabha_admin', 'ward_volunteer'].includes(userRole) && (
                                     <div className="space-y-1.5">
                                      <Label>संभाग (Sambhag)</Label>
                                      <Select value={locHierarchy.sambhag} onValueChange={v => handleLocChange('sambhag', v)} disabled={!locHierarchy.state}>
                                          <SelectTrigger><SelectValue placeholder="संभाग चुनें..." /></SelectTrigger>
                                          <SelectContent>{locations.filter(l => l.type === 'sambhag' && l.parent === locHierarchy.state).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                      </Select>
                                     </div>
                                   )}

                                   {['district_admin', 'zone_admin', 'vidhansabha_admin', 'ward_volunteer'].includes(userRole) && (
                                     <div className="space-y-1.5">
                                      <Label>लोकसभा (Loksabha)</Label>
                                      <Select value={locHierarchy.loksabha} onValueChange={v => handleLocChange('loksabha', v)} disabled={!locHierarchy.sambhag}>
                                          <SelectTrigger><SelectValue placeholder="लोकसभा चुनें..." /></SelectTrigger>
                                          <SelectContent>{locations.filter(l => l.type === 'loksabha' && l.parent === locHierarchy.sambhag).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                      </Select>
                                     </div>
                                   )}

                                   {['district_admin', 'zone_admin', 'vidhansabha_admin', 'ward_volunteer'].includes(userRole) && (
                                     <div className="space-y-1.5">
                                      <Label>ज़िला (District)</Label>
                                      <Select value={locHierarchy.district} onValueChange={v => handleLocChange('district', v)} disabled={!locHierarchy.loksabha}>
                                          <SelectTrigger><SelectValue placeholder="ज़िला चुनें..." /></SelectTrigger>
                                          <SelectContent>{locations.filter(l => l.type === 'district' && l.parent === locHierarchy.loksabha).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                      </Select>
                                     </div>
                                   )}

                                   {['zone_admin'].includes(userRole) && (
                                     <div className="space-y-1.5">
                                      <Label>ज़ोन (Zone)</Label>
                                      <Select value={locHierarchy.zone} onValueChange={v => handleLocChange('zone', v)} disabled={!locHierarchy.district}>
                                          <SelectTrigger><SelectValue placeholder="ज़ोन चुनें..." /></SelectTrigger>
                                          <SelectContent>{locations.filter(l => l.type === 'zone' && l.parent === locHierarchy.district).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                      </Select>
                                     </div>
                                   )}

                                   {['vidhansabha_admin', 'ward_volunteer'].includes(userRole) && (
                                     <div className="space-y-1.5">
                                      <Label>विधानसभा (Vidhansabha)</Label>
                                      <Select value={locHierarchy.vidhansabha} onValueChange={v => handleLocChange('vidhansabha', v)} disabled={!locHierarchy.district}>
                                          <SelectTrigger><SelectValue placeholder="विधानसभा चुनें..." /></SelectTrigger>
                                          <SelectContent>{locations.filter(l => l.type === 'vidhansabha' && l.parent === locHierarchy.district).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                      </Select>
                                     </div>
                                   )}

                                   {['ward_volunteer'].includes(userRole) && (
                                     <div className="space-y-1.5">
                                      <Label>वार्ड (Ward)</Label>
                                      <Select value={locHierarchy.ward} onValueChange={v => handleLocChange('ward', v)} disabled={!locHierarchy.vidhansabha}>
                                          <SelectTrigger><SelectValue placeholder="वार्ड चुनें..." /></SelectTrigger>
                                          <SelectContent>{locations.filter(l => l.type === 'ward' && l.parent === locHierarchy.vidhansabha).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                      </Select>
                                     </div>
                                   )}
                               </div>
                            )}

                            <Button onClick={handleCreateUser} className="w-full mt-4" size="lg">{editingUserId ? "खाता अपडेट करें (Update)" : "खाता बनाएं (Create Account)"}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="glass-card border-none shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="font-bold">नाम (Name)</TableHead>
                                <TableHead className="font-bold">भूमिका (Role)</TableHead>
                                <TableHead className="font-bold">समुदाय (Community)</TableHead>
                                <TableHead className="font-bold">स्थान (Location)</TableHead>
                                <TableHead className="text-right font-bold pr-6">स्थिति (Status)</TableHead>
                                <TableHead className="text-right font-bold">कार्रवाई</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(u => (
                                <TableRow key={u.id} className="hover:bg-muted/20 transition-colors">
                                    <TableCell>
                                        <div className="font-semibold">{u.name}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase">{u.email}</div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline" className="capitalize text-[10px] bg-background">{u.role.replace('_', ' ')}</Badge></TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {communities.find(c => c.id === u.community)?.name || <span className="opacity-40">वैश्विक (Global)</span>}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {locations.find(l => l.id === u.location)?.name || <span className="opacity-40">निर्दिष्ट नहीं (Unassigned)</span>}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400">सक्रिय (Active)</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEditUserClick(u)} title="संपादित करें"><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteUserClick(u.id)} title="हटाएं"><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="communities" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-xl font-heading font-bold">समुदाय निर्देशिका (Community Directory)</h2>
                   <p className="text-xs text-muted-foreground mt-0.5">जनगणना संग्रह के लिए समुदाय कार्यक्षेत्र परिभाषित करें</p>
                </div>
                <Dialog open={isCommOpen} onOpenChange={setIsCommOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" variant="outline"><Plus className="h-4 w-4" /> नया समुदाय जोड़ें</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle className="font-heading border-b pb-2">नई समुदाय प्रविष्टि (New Community)</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-1.5"><Label>समुदाय का नाम (Name)</Label><Input value={commName} onChange={e=>setCommName(e.target.value)} placeholder="जैसे: विश्वकर्मा" className="mt-1" /></div>
                            <div className="space-y-1.5"><Label>विवरण / जानकारी (Description)</Label><Input value={commDesc} onChange={e=>setCommDesc(e.target.value)} placeholder="संक्षिप्त अवलोकन..." className="mt-1" /></div>
                            <Button onClick={handleCreateCommunity} className="w-full mt-2" size="lg">समुदाय पंजीकृत करें (Save)</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {communities.map(c => (
                    <Card key={c.id} className="glass-card border-none group hover:bg-muted/40 transition-all">
                        <CardHeader className="pb-3 flex flex-row items-start justify-between">
                           <div>
                              <CardTitle className="text-base font-bold">{c.name}</CardTitle>
                              <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">जनगणना सीमा (Scope)</p>
                           </div>
                           <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Building2 className="h-4 w-4" /></div>
                        </CardHeader>
                        <CardContent>
                           <p className="text-xs text-muted-foreground line-clamp-2 italic">"{c.description || 'कोई विवरण नहीं दिया गया।'}"</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>

        <TabsContent value="locations" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-bold">भौगोलिक रजिस्ट्री (Geographic Registry)</h2>
                <Dialog open={isLocOpen} onOpenChange={(open) => { setIsLocOpen(open); if(!open) { setEditingLocId(null); setLocName(""); }}}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingLocId(null); setLocName(""); setLocProps({state:"", sambhag:"", loksabha:"", district:"", vidhansabha:""}); setLocType("state"); }} className="gap-2" variant="outline"><MapPin className="h-4 w-4" /> नया स्थान जोड़ें</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle className="font-heading">{editingLocId ? "क्षेत्र अपडेट करें (Update Area)" : "नया क्षेत्र परिभाषित करें (Define Area)"}</DialogTitle></DialogHeader>
                        <div className="grid gap-5 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><Label>क्षेत्र का नाम (Area Name)</Label><Input value={locName} onChange={e=>setLocName(e.target.value)} placeholder="जैसे: राजस्थान" className="mt-1" /></div>
                                <div className="space-y-1.5">
                                    <Label>पदानुक्रमित स्तर (Level)</Label>
                                    <Select value={locType} onValueChange={(val) => { setLocType(val); setLocProps({state:"", sambhag:"", loksabha:"", district:"", vidhansabha:""}); }}>
                                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="state">राज्य (State)</SelectItem>
                                            <SelectItem value="sambhag">संभाग (Sambhag)</SelectItem>
                                            <SelectItem value="loksabha">लोकसभा (Loksabha)</SelectItem>
                                            <SelectItem value="district">ज़िला (District)</SelectItem>
                                            <SelectItem value="zone">ज़ोन (Zone)</SelectItem>
                                            <SelectItem value="vidhansabha">विधानसभा (Vidhansabha)</SelectItem>
                                            <SelectItem value="ward">वार्ड (Ward)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {locType !== 'state' && (
                                <div className="p-4 bg-muted/40 rounded-xl space-y-4 border border-border/50 shadow-inner">
                                    <p className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
                                      <MapPin className="h-3 w-3" /> मूल अनुक्रम चुनें (Select Parent)
                                    </p>
                                    
                                    <div className="space-y-1.5">
                                        <Label>राज्य (State)</Label>
                                        <Select value={locProps.state} onValueChange={(v) => handleLocParentChange('state', v)}>
                                            <SelectTrigger><SelectValue placeholder="राज्य चुनें..." /></SelectTrigger>
                                            <SelectContent>{locations.filter(l => l.type === 'state').map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>

                                    {['loksabha', 'district', 'zone', 'vidhansabha', 'ward'].includes(locType) && (
                                        <div className="space-y-1.5">
                                            <Label>संभाग (Sambhag)</Label>
                                            <Select value={locProps.sambhag} onValueChange={(v) => handleLocParentChange('sambhag', v)} disabled={!locProps.state}>
                                                <SelectTrigger><SelectValue placeholder="संभाग चुनें..." /></SelectTrigger>
                                                <SelectContent>{locations.filter(l => l.type === 'sambhag' && l.parent === locProps.state).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {['district', 'zone', 'vidhansabha', 'ward'].includes(locType) && (
                                        <div className="space-y-1.5">
                                            <Label>लोकसभा (Loksabha)</Label>
                                            <Select value={locProps.loksabha} onValueChange={(v) => handleLocParentChange('loksabha', v)} disabled={!locProps.sambhag}>
                                                <SelectTrigger><SelectValue placeholder="लोकसभा चुनें..." /></SelectTrigger>
                                                <SelectContent>{locations.filter(l => l.type === 'loksabha' && l.parent === locProps.sambhag).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {(locType === 'vidhansabha' || locType === 'zone' || locType === 'ward') && (
                                        <div className="space-y-1.5">
                                            <Label>ज़िला (District)</Label>
                                            <Select value={locProps.district} onValueChange={(v) => handleLocParentChange('district', v)} disabled={!locProps.loksabha}>
                                                <SelectTrigger><SelectValue placeholder="ज़िला चुनें..." /></SelectTrigger>
                                                <SelectContent>{locations.filter(l => l.type === 'district' && l.parent === locProps.loksabha).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {locType === 'ward' && (
                                        <div className="space-y-1.5">
                                            <Label>विधानसभा (Vidhansabha)</Label>
                                            <Select value={locProps.vidhansabha} onValueChange={(v) => handleLocParentChange('vidhansabha', v)} disabled={!locProps.district}>
                                                <SelectTrigger><SelectValue placeholder="विधानसभा चुनें..." /></SelectTrigger>
                                                <SelectContent>{locations.filter(l => l.type === 'vidhansabha' && l.parent === locProps.district).map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button onClick={handleCreateLocation} className="w-full mt-4" size="lg" disabled={!locName || (locType !== 'state' && !finalLocParent)}>क्षेत्र सहेजें (Save)</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="glass-card border-none p-6">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                       <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">पदानुक्रमित विभाजन (Breakdown)</h3>
                        <div className="space-y-3">
                            {[
                                { type: 'state', label: 'राज्य', icon: 'S' },
                                { type: 'sambhag', label: 'संभाग', icon: 'M' },
                                { type: 'loksabha', label: 'लोकसभा', icon: 'L' },
                                { type: 'district', label: 'ज़िला', icon: 'D' },
                                { type: 'vidhansabha', label: 'विधानसभा', icon: 'V' },
                                { type: 'ward', label: 'वार्ड', icon: 'W' }
                            ].map(obj => (
                                <div key={obj.type} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded bg-white dark:bg-black/40 flex items-center justify-center font-bold text-xs uppercase text-muted-foreground">{obj.icon}</div>
                                        <span className="text-sm font-semibold">{obj.label} ({obj.type})</span>
                                    </div>
                                    <Badge variant="outline">{locations.filter(l => l.type === obj.type).length}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">सभी क्षेत्र (All Areas)</h3>
                        <div className="max-h-[500px] overflow-y-auto rounded-md border text-sm">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm border-b">
                                    <TableRow>
                                        <TableHead>नाम (Name)</TableHead>
                                        <TableHead>स्तर (Type)</TableHead>
                                        <TableHead>मूल अनुक्रम (Parent)</TableHead>
                                        <TableHead className="text-right">कार्रवाई (Actions)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {locations.map(l => (
                                        <TableRow key={l.id} className="hover:bg-muted/30">
                                            <TableCell className="font-medium">{l.name}</TableCell>
                                            <TableCell><Badge variant="outline" className="capitalize text-[10px] bg-background">{l.type}</Badge></TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{locations.find(p => p.id === l.parent)?.name || '--'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEditLocClick(l)} title="संपादित करें"><Pencil className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteLocClick(l.id)} title="हटाएं"><Trash2 className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const StatDisplay = ({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color: string }) => (
    <Card className="glass-card border-none hover:shadow-md transition-all group active:scale-[0.98]">
        <CardContent className="p-5 flex justify-between items-center">
            <div>
                <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{title}</p>
                <p className="text-3xl font-bold mt-1.5">{value}</p>
            </div>
            <div className={`p-2.5 rounded-xl bg-muted group-hover:bg-white dark:group-hover:bg-black/40 transition-colors ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
        </CardContent>
    </Card>
);
