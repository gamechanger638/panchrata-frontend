import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Eye, Pencil, Trash2, Plus, Search, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/context/AuthContext";
import { getMembers, createMember, deleteMember } from "@/services/membersApi";
import { getFamilies } from "@/services/familiesApi";

export default function MembersPage() {
  const { user } = useAuth();
  const [membersData, setMembersData] = useState<any[]>([]);
  const [familiesData, setFamiliesData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Add Member Form State
  const [familyId, setFamilyId] = useState("");
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [dob, setDob] = useState("");
  const [education, setEducation] = useState("");
  const [profession, setProfession] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [mobile, setMobile] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [memRes, famRes] = await Promise.all([
        getMembers(),
        getFamilies()
      ]);
      
      setMembersData(memRes.data.results || memRes.data || []);
      setFamiliesData(famRes.data.results || famRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = membersData.filter((m: any) => {
    const s = search.toLowerCase();
    return m.name?.toLowerCase().includes(s) || m.mobile?.includes(s) || m.relation?.toLowerCase().includes(s);
  });

  const handleAddMember = async () => {
    if (!familyId) {
      toast({ title: "कृपया एक परिवार चुनें (Please select a family)", variant: "destructive" });
      return;
    }
    try {
      const payload = { family: familyId, name, relation, dob, education, profession, marital_status: maritalStatus, mobile };
      await createMember(payload);

      toast({ title: "सदस्य सफलतापूर्वक जोड़ा गया (Member added successfully)" });
      setIsOpen(false);
      fetchData();
      
      // Reset loosely
      setName(""); setRelation(""); setDob(""); setEducation(""); setProfession(""); setMaritalStatus(""); setMobile("");
    } catch (e: any) {
      const msg = e.response?.data ? JSON.stringify(e.response.data) : e.message;
      toast({ title: "त्रुटि (Error)", description: msg, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("क्या आप सुनिश्चित हैं कि आप इसे हटाना चाहते हैं?")) return;
    try {
      await deleteMember(id);
      toast({ title: "सदस्य हटा दिया गया है" });
      fetchData();
    } catch (e) {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">सदस्य सूची (Members)</h1>
          <p className="text-sm text-muted-foreground mt-1">अपने क्षेत्र के सभी सदस्यों का विवरण प्रबंधित करें</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> नया सदस्य जोड़ें</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-heading border-b pb-2">नया सदस्य विवरण दर्ज करें</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-5 py-4">
              <div className="col-span-2">
                <Label>परिवार का चयन करें (Select Family) <span className="text-red-500">*</span></Label>
                <Select value={familyId} onValueChange={setFamilyId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="सूची से परिवार खोजें और चुनें" /></SelectTrigger>
                  <SelectContent>
                    {familiesData.map((f: any) => (
                      <SelectItem key={f.id} value={f.id}>{f.name} (कोड: {f.family_code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2"><Label>पूरा नाम (Full Name) <span className="text-red-500">*</span></Label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="व्यक्ति का पूरा नाम" className="mt-1" /></div>
              
              <div><Label>मुखिया से रिश्ता (Relation)</Label><Input value={relation} onChange={e=>setRelation(e.target.value)} placeholder="जैसे: बेटा, पत्नी, भाई..." className="mt-1" /></div>
              <div><Label>जन्म तिथि (DOB)</Label><Input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="mt-1" /></div>
              
              <div><Label>शिक्षा (Education)</Label><Input value={education} onChange={e=>setEducation(e.target.value)} placeholder="शैक्षिक योग्यता" className="mt-1" /></div>
              <div><Label>व्यवसाय / पेशा (Profession)</Label><Input value={profession} onChange={e=>setProfession(e.target.value)} placeholder="काम / व्यापार" className="mt-1" /></div>
              
              <div>
                <Label>वैवाहिक स्थिति (Marital Status)</Label>
                <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="वैवाहिक स्थिति चुनें" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="unmarried">अविवाहित (Unmarried)</SelectItem>
                      <SelectItem value="married">विवाहित (Married)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div><Label>मोबाइल (Mobile)</Label><Input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="10-अंकीय नंबर " className="mt-1" /></div>
              
              <div className="col-span-2 mt-2"><Button className="w-full" size="lg" onClick={handleAddMember} disabled={!familyId || !name}>सदस्य सहेजें (Save)</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="सदस्य का नाम, रिश्ता या मोबाइल नंबर से खोजें..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-bold">नाम (Name)</TableHead>
              <TableHead className="font-bold">रिश्ता (Relation)</TableHead>
              <TableHead className="hidden md:table-cell font-bold">मोबाइल</TableHead>
              <TableHead className="hidden md:table-cell font-bold">शिक्षा</TableHead>
              <TableHead className="hidden lg:table-cell font-bold">व्यवसाय</TableHead>
              <TableHead className="font-bold">स्थिति (Status)</TableHead>
              <TableHead className="font-bold">कार्रवाई</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">डेटा लोड हो रहा है (Loading)...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
               <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">इस क्षेत्र में कोई सदस्य नहीं मिला।</TableCell></TableRow>
            ) : (
             filtered.map((m: any) => (
              <TableRow key={m.id} className="hover:bg-muted/10">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted h-8 w-8 rounded-full flex items-center justify-center text-primary/70 ring-1 ring-border">
                       <User className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-primary">{m.name}</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-xs bg-background">{m.relation || "N/A"}</Badge></TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{m.mobile || "N/A"}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{m.education || "N/A"}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{m.profession || "N/A"}</TableCell>
                <TableCell>
                    <Badge variant={m.marital_status === "married" ? "outline" : "secondary"} className={`text-xs ${m.marital_status === "married" ? "border-green-200 text-green-700 bg-green-50" : ""}`}>
                        {m.marital_status === "married" ? "विवाहित" : m.marital_status === "unmarried" ? "अविवाहित" : (m.marital_status || "N/A")}
                    </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user?.role === 'super_admin' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(m.id)} title="हटाएं (Delete)">
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
