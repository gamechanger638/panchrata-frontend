import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMember } from "@/services/membersApi";
import { API_BASE_URL } from "@/services/api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, Phone, MapPin, BookOpen, Briefcase, Heart, 
  Droplets, Users, Ruler, Palette, Camera, Mail, Facebook, 
  MapPinned, Info, Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const calculateAge = (dobString: string) => {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

const avatarUrl = (seed: string) => `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=4f7cff,2dd4bf,f59e0b,a855f7,ef4444`;

const MARITAL_STATUS_LABELS: Record<string, string> = {
    'married': 'विवाहित (Married)',
    'unmarried': 'अविवाहित (Unmarried)',
    'widow': 'विधवा (Widow)',
    'widower': 'विधुर (Widower)',
    'divorced': 'तलाकशुदा (Divorced)'
};

export default function MemberProfile() {
  const { id } = useParams();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await getMember(id);
        const m = res.data;
        const baseUrl = API_BASE_URL.replace('/api', '');
        
        const profileImageUrl = m.profile_image 
          ? (m.profile_image.startsWith('http') ? m.profile_image : `${baseUrl}${m.profile_image}`)
          : avatarUrl(m.name || "User");
          
        const gotraImageUrl = m.gotra_image 
          ? (m.gotra_image.startsWith('http') ? m.gotra_image : `${baseUrl}${m.gotra_image}`)
          : null;

        const photo1Url = m.photo1 ? (m.photo1.startsWith('http') ? m.photo1 : `${baseUrl}${m.photo1}`) : null;
        const photo2Url = m.photo2 ? (m.photo2.startsWith('http') ? m.photo2 : `${baseUrl}${m.photo2}`) : null;
        const photo3Url = m.photo3 ? (m.photo3.startsWith('http') ? m.photo3 : `${baseUrl}${m.photo3}`) : null;

        setMember({
          ...m,
          age: calculateAge(m.dob),
          city: m.district_name || "N/A",
          gotra: m.family_gotra || "N/A",
          photo: profileImageUrl,
          photo1: photo1Url,
          photo2: photo2Url,
          photo3: photo3Url,
          gotra_image: gotraImageUrl
        });

      } catch (e: any) {
        toast({ title: "Error", description: "Could not fetch member profile", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id, toast]);

  if (loading) return <div className="p-12 text-center animate-pulse flex flex-col items-center gap-4">
    <div className="h-20 w-20 bg-slate-200 rounded-full animate-bounce" />
    <span className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Profile...</span>
  </div>;

  if (!member) return <div className="p-8 text-center text-muted-foreground bg-white rounded-3xl m-8 shadow-sm">Member not found</div>;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-20 px-4 md:px-0">
      <div className="flex items-center justify-between">
         <Button variant="ghost" size="sm" asChild className="rounded-xl hover:bg-slate-100">
            <Link to="/ward-volunteer/members" className="flex items-center font-bold">
               <ArrowLeft className="h-4 w-4 mr-2" /> डेटाबेस पर लौटें (Back)
            </Link>
         </Button>
      </div>

      {/* Header Profile Hero */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white group">
        <div className="bg-gradient-to-br from-[#1e40af] via-[#3b82f6] to-[#60a5fa] p-8 md:p-14 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
            <div className="relative shrink-0">
               <div className="h-44 w-44 rounded-[2rem] bg-white p-2 shadow-2xl relative group/img">
                  <img src={member.photo} alt={member.name} className="h-full w-full rounded-[1.5rem] object-cover" />
                  <div className="absolute inset-0 bg-black/20 rounded-[1.5rem] opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="text-white h-8 w-8" />
                  </div>
               </div>
               {member.marital_status === "unmarried" && (
                 <Badge className="absolute -top-3 -right-3 bg-yellow-400 text-black hover:bg-yellow-500 border-4 border-white px-4 py-1.5 font-black uppercase text-[10px] shadow-lg rounded-xl">
                    Matching Available
                 </Badge>
               )}
            </div>
            
            <div className="text-center md:text-left space-y-4">
              <div className="space-y-1">
                 <h1 className="text-4xl md:text-6xl font-heading font-black text-white tracking-tighter drop-shadow-sm">{member.name}</h1>
                 <p className="text-blue-100 font-bold text-lg md:text-xl flex items-center justify-center md:justify-start gap-2">
                    {member.relation} of Head • {member.age} Years • {member.gender?.toUpperCase()}
                 </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-md px-5 py-2 rounded-xl font-bold flex gap-2 items-center">
                   <BookOpen className="h-4 w-4" /> {member.family_gotra || "Gotra"}
                </Badge>
                <Badge className={`border-0 backdrop-blur-md px-5 py-2 rounded-xl font-bold ${member.marital_status === 'unmarried' ? 'bg-orange-500/20 text-orange-100' : 'bg-emerald-500/20 text-emerald-100'}`}>
                   {MARITAL_STATUS_LABELS[member.marital_status] || member.marital_status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Sidebar/Quick Info */}
         <div className="lg:col-span-1 space-y-8">
            <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
               <CardHeader className="bg-slate-50 border-b p-6">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                     <Info className="h-4 w-4" /> Physical & Social
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shadow-sm"><Droplets className="h-6 w-6 fill-red-500" /></div>
                        <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Blood Group</p><p className="font-bold text-slate-800 text-lg">{member.blood_group || "N/A"}</p></div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-1">Height</p>
                        <p className="font-bold text-slate-800 flex items-center gap-2"><Ruler className="h-4 w-4 text-primary" /> {member.height || "N/A"}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-1">Complexion</p>
                        <p className="font-bold text-slate-800 flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> {member.colour || "N/A"}</p>
                     </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-slate-50">
                     <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                         <span className="text-sm font-bold text-slate-500">Facebook</span>
                         <Facebook className="h-5 w-5 text-blue-600 opacity-60 group-hover:opacity-100" />
                     </div>
                     <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                         <span className="text-sm font-bold text-slate-500">Email</span>
                         <Mail className="h-5 w-5 text-slate-400 opacity-60 group-hover:opacity-100" />
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
                <CardHeader className="bg-orange-50 border-b border-orange-100 p-6">
                   <CardTitle className="text-sm font-black uppercase tracking-widest text-orange-400 flex items-center gap-2">
                      <Droplets className="h-4 w-4" /> Gotra Symbol
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                   {member.gotra_image ? (
                     <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-inner">
                        <img src={member.gotra_image} className="w-full h-auto object-contain p-4" alt="Gotra Symbol" />
                     </div>
                   ) : (
                     <div className="p-8 text-center text-slate-300 italic text-sm">No gotra symbol uploaded.</div>
                   )}
                </CardContent>
            </Card>
         </div>

         {/* Main Content Areas */}
         <div className="lg:col-span-2 space-y-8">
            {/* Details Section */}
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-none shadow-xl rounded-3xl bg-white">
                    <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-heading font-black text-slate-800 flex items-center gap-3">
                           <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Briefcase className="h-5 w-5" /></div> Career
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-8">
                       <div className="space-y-4">
                          <div><p className="text-xs text-slate-400 font-bold uppercase mb-2">Education & Degree</p>
                          <p className="text-slate-800 font-black text-lg">{member.education || "N/A"}</p>
                          <p className="text-slate-500 font-bold">{member.degree_diploma}</p></div>
                          
                          <div className="pt-4 border-t"><p className="text-xs text-slate-400 font-bold uppercase mb-2">Profession & Income</p>
                          <p className="text-slate-800 font-black text-lg">{member.profession || "N/A"}</p>
                          <p className="text-primary font-bold">{member.monthly_income}</p></div>
                          
                          <div className="pt-4 border-t"><p className="text-xs text-slate-400 font-bold uppercase mb-2">Organization</p>
                          <p className="text-slate-700 font-bold leading-tight">{member.organization_company || "N/A"}</p></div>
                       </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-3xl bg-white">
                    <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-heading font-black text-slate-800 flex items-center gap-3">
                           <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl"><MapPin className="h-5 w-5" /></div> Address
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-8">
                       <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 flex-none rounded-xl bg-slate-50 flex items-center justify-center"><MapPinned className="h-5 w-5 text-slate-400" /></div>
                                <div><p className="text-[10px] text-slate-400 font-black uppercase mb-1">Birth Place</p><p className="font-bold text-slate-800">{member.birth_place || "N/A"}</p></div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 flex-none rounded-xl bg-slate-50 flex items-center justify-center"><MapPin className="h-5 w-5 text-slate-400" /></div>
                                <div><p className="text-[10px] text-slate-400 font-black uppercase mb-1">Current Residence</p><p className="font-bold text-slate-800 leading-relaxed">{member.current_address || "Same as Family"}</p></div>
                            </div>
                            <div className="flex items-start gap-4 pt-4 border-t">
                                <div className="h-10 w-10 flex-none rounded-xl bg-slate-50 flex items-center justify-center"><Phone className="h-5 w-5 text-slate-400" /></div>
                                <div><p className="text-[10px] text-slate-400 font-black uppercase mb-1">Contact Details</p><p className="font-bold text-slate-800 text-lg">{member.mobile || "Private"}</p><p className="text-xs text-slate-400 italic">Landline: {member.telephone || "N/A"}</p></div>
                            </div>
                       </div>
                    </CardContent>
                </Card>
            </div>

            {/* Photo Gallery Expanded */}
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardHeader className="p-8 border-b bg-slate-50/50 flex flex-row items-center justify-between">
                   <CardTitle className="text-xl font-heading font-black text-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-purple-50 text-purple-500 rounded-xl"><Camera className="h-5 w-5" /></div> Photo Gallery
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {[member.photo, member.photo1, member.photo2, member.photo3].filter(Boolean).map((img, i) => (
                           <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-slate-100 ring-2 ring-white hover:ring-primary transition-all group relative cursor-pointer">
                              <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                 <Plus className="text-white h-6 w-6" />
                              </div>
                           </div>
                        ))}
                   </div>
                </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
