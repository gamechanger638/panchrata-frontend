import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, Mail, Phone, BookOpen, Briefcase, Camera, Trash2, 
  Plus, Heart, MapPin, Search, Droplets, Ruler, Palette, MapPinned
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/services/api";
import { createMember, updateMember } from "@/services/membersApi";
import { getFamilies } from "@/services/familiesApi";

interface MemberFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  familyId?: string;
  memberData?: any;
  onSuccess: () => void;
}

export default function MemberFormDialog({ isOpen, onClose, familyId: initialFamilyId, memberData, onSuccess }: MemberFormDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [families, setFamilies] = useState<any[]>([]);
  const [familyId, setFamilyId] = useState(initialFamilyId || "");

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const res = await getFamilies();
        setFamilies(res.data.results || res.data || []);
      } catch (e) {}
    };
    if (isOpen) fetchFamilies();
  }, [isOpen]);

  useEffect(() => {
    if (initialFamilyId) setFamilyId(initialFamilyId);
  }, [initialFamilyId]);
  
  // Form State
  const [formData, setFormData] = useState<any>({
    name: "",
    father_name: "",
    relation: "Self",
    gender: "male",
    dob: "",
    blood_group: "",
    marital_status: "unmarried",
    mobile: "",
    telephone: "",
    email: "",
    facebook: "",
    education: "",
    degree_diploma: "",
    profession: "",
    occupation_designation: "",
    organization_company: "",
    monthly_income: "",
    height: "",
    colour: "",
    birth_place: "",
    current_address: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [gotraImage, setGotraImage] = useState<File | null>(null);
  const [gotraPreview, setGotraPreview] = useState<string | null>(null);
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null]);
  const [photoPreviews, setPhotoPreviews] = useState<(string | null)[]>([null, null, null]);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const gotraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (memberData) {
      setFormData({
        ...memberData,
        relation: memberData.relation || "Self",
        gender: memberData.gender || "male",
        marital_status: memberData.marital_status || "unmarried",
      });
      if (memberData.profile_image) setProfilePreview(memberData.profile_image.startsWith('http') ? memberData.profile_image : `${API_BASE_URL.replace('/api', '')}${memberData.profile_image}`);
      if (memberData.gotra_image) setGotraPreview(memberData.gotra_image.startsWith('http') ? memberData.gotra_image : `${API_BASE_URL.replace('/api', '')}${memberData.gotra_image}`);
      
      const pPreviews = [memberData.photo1, memberData.photo2, memberData.photo3].map(p => 
        p ? (p.startsWith('http') ? p : `${API_BASE_URL.replace('/api', '')}${p}`) : null
      );
      setPhotoPreviews(pPreviews);
    } else {
      resetForm();
    }
  }, [memberData, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      father_name: "",
      relation: "Self",
      gender: "male",
      dob: "",
      blood_group: "",
      marital_status: "unmarried",
      mobile: "",
      telephone: "",
      email: "",
      facebook: "",
      education: "",
      degree_diploma: "",
      profession: "",
      occupation_designation: "",
      organization_company: "",
      monthly_income: "",
      height: "",
      colour: "",
      birth_place: "",
      current_address: "",
    });
    setProfileImage(null);
    setProfilePreview(null);
    setGotraImage(null);
    setGotraPreview(null);
    setPhotos([null, null, null]);
    setPhotoPreviews([null, null, null]);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'gotra' | 'photo', index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'profile') {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else if (type === 'gotra') {
      setGotraImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setGotraPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else if (type === 'photo' && index !== undefined) {
      const newPhotos = [...photos];
      newPhotos[index] = file;
      setPhotos(newPhotos);
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...photoPreviews];
        newPreviews[index] = reader.result as string;
        setPhotoPreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({ title: "नाम अनिवार्य है (Name is required)", variant: "destructive" });
      return;
    }
    if (!familyId) {
      toast({ title: "परिवार का चयन अनिवार्य है", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("family", familyId);
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });
      
      if (profileImage) submitData.append("profile_image", profileImage);
      if (gotraImage) submitData.append("gotra_image", gotraImage);
      if (photos[0]) submitData.append("photo1", photos[0]);
      if (photos[1]) submitData.append("photo2", photos[1]);
      if (photos[2]) submitData.append("photo3", photos[2]);

      if (memberData?.id) {
        await updateMember(memberData.id, submitData);
        toast({ title: "सदस्य सफलतापूर्वक अपडेट किया गया" });
      } else {
        await createMember(submitData);
        toast({ title: "सदस्य सफलतापूर्वक जोड़ा गया" });
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to save", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full h-[90vh] p-0 border-none rounded-2xl overflow-hidden bg-white shadow-2xl flex flex-col">
        {/* Fixed Header */}
        <DialogHeader className="p-6 bg-primary text-primary-foreground flex-none shadow-md">
          <DialogTitle className="text-xl md:text-2xl font-heading flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm"><User className="h-6 w-6" /></div>
            <div>
               <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Member Information Form</p>
               <span className="font-black tracking-tight">{memberData ? "सदस्य विवरण अपडेट करें (Update Profile)" : "नया सदस्य विवरण दर्ज करें (New Member)"}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar bg-[#f8fafc] p-6 md:p-8 space-y-10">
          
          {/* Section 0: Fixed Context (Select Family if not provided) */}
          {!initialFamilyId && (
            <section className="bg-primary/5 p-6 rounded-3xl border-2 border-primary/10 space-y-4 animate-pulse-subtle">
              <Label className="font-black text-primary flex items-center gap-2 text-sm uppercase tracking-wider">
                 <Search className="h-4 w-4" /> परिवार का चयन करें (Select Family) <span className="text-red-500">*</span>
              </Label>
              <Select value={familyId} onValueChange={setFamilyId}>
                  <SelectTrigger className="h-12 rounded-2xl bg-white border-slate-200 text-lg font-bold shadow-sm">
                    <SelectValue placeholder="सूची से परिवार खोजें" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200">
                    {families.map(f => (
                      <SelectItem key={f.id} value={f.id} className="py-3 rounded-xl">{f.name} <span className="text-slate-400 text-xs ml-2">(कोड: {f.family_code})</span></SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </section>
          )}

          {/* Section 1: Basic & Physical Info */}
          <section className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
            <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-base font-black uppercase tracking-wider text-slate-800 flex items-center gap-3">
                   <div className="p-2 bg-pink-50 text-pink-500 rounded-xl"><Heart className="h-5 w-5 fill-pink-500" /></div>
                   1. व्यक्तिगत एवं शारीरिक (Personal & Physical)
                </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-slate-600 font-bold ml-1">पूरा नाम (Full Name) <span className="text-red-500">*</span></Label>
                <Input value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="आधार कार्ड के अनुसार नाम दर्ज करें" className="rounded-2xl border-slate-200 focus:ring-primary h-12 text-lg font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-bold ml-1">पिता/पति का नाम (Father/Husband Name)</Label>
                <Input value={formData.father_name} onChange={e => handleInputChange('father_name', e.target.value)} placeholder="पिता या पति का नाम" className="rounded-2xl border-slate-200 h-12 font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-bold ml-1">रिश्ता (Relationship to Head)</Label>
                <Select value={formData.relation} onValueChange={v => handleInputChange('relation', v)}>
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {['Self', 'Father', 'Mother', 'Husband', 'Wife', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandson', 'Granddaughter'].map(r => (
                       <SelectItem key={r} value={r} className="rounded-xl">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-bold ml-1">लिंग (Gender)</Label>
                <Select value={formData.gender} onValueChange={v => handleInputChange('gender', v)}>
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="male" className="rounded-xl">पुरुष (Male)</SelectItem>
                    <SelectItem value="female" className="rounded-xl">महिला (Female)</SelectItem>
                    <SelectItem value="other" className="rounded-xl">अन्य (Other)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-bold ml-1">जन्म तिथि (DOB)</Label>
                <Input type="date" value={formData.dob} onChange={e => handleInputChange('dob', e.target.value)} className="rounded-2xl h-12 border-slate-200 font-bold" />
              </div>
              <div className="space-y-2">
                  <Label className="text-slate-600 font-bold ml-1">जन्म स्थान (Birth Place)</Label>
                  <div className="relative">
                     <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     <Input value={formData.birth_place} onChange={e => handleInputChange('birth_place', e.target.value)} placeholder="City/Village" className="pl-10 rounded-2xl h-12 border-slate-200" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label className="text-slate-600 font-bold ml-1">वैवाहिक स्थिति (Marital Status)</Label>
                  <Select value={formData.marital_status} onValueChange={v => handleInputChange('marital_status', v)}>
                    <SelectTrigger className="rounded-2xl h-12 border-slate-200 font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="unmarried" className="rounded-xl">अविवाहित (Unmarried)</SelectItem>
                      <SelectItem value="married" className="rounded-xl">विवाहित (Married)</SelectItem>
                      <SelectItem value="widow" className="rounded-xl">विधवा (Widow)</SelectItem>
                      <SelectItem value="widower" className="rounded-xl">विधुर (Widower)</SelectItem>
                      <SelectItem value="divorced" className="rounded-xl">तलाकशुदा (Divorced)</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                  <Label className="text-slate-600 font-bold ml-1">ब्लड ग्रुप (Blood Group)</Label>
                  <Select value={formData.blood_group} onValueChange={v => handleInputChange('blood_group', v)}>
                    <SelectTrigger className="rounded-2xl h-12 border-slate-200 font-bold flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-red-500" /> <SelectValue placeholder="चुने" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <SelectItem key={bg} value={bg} className="rounded-xl">{bg}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-bold ml-1">ऊंचाई (Height - ft/in)</Label>
                <div className="relative">
                   <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <Input value={formData.height} onChange={e => handleInputChange('height', e.target.value)} placeholder={"उदा: 5'8\""} className="pl-10 rounded-2xl h-12 border-slate-200" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-bold ml-1">रंग / वर्ण (Complexion)</Label>
                <div className="relative">
                   <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <Input value={formData.colour} onChange={e => handleInputChange('colour', e.target.value)} placeholder="उदा: गोरा, गेंहुआ" className="pl-10 rounded-2xl h-12 border-slate-200" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Professional & Education */}
          <section className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
            <h3 className="text-base font-black uppercase tracking-wider text-slate-800 flex items-center gap-3 border-b pb-4">
               <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Briefcase className="h-5 w-5" /></div>
               2. शैक्षणिक एवं व्यावसायिक (Education & Career)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label className="text-slate-600 font-bold ml-1">उच्चतम योग्यता (Highest Qualification)</Label>
                 <Select value={formData.education} onValueChange={v => handleInputChange('education', v)}>
                    <SelectTrigger className="rounded-2xl h-12 border-slate-200 font-bold"><SelectValue placeholder="चुने" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {['Illiterate', 'Literate', '5th', '8th', '10th', '12th', 'Diploma', 'Graduate', 'Post Graduate', 'Doctorate', 'PhD', 'Other'].map(q => <SelectItem key={q} value={q} className="rounded-xl">{q}</SelectItem>)}
                    </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label className="text-slate-600 font-bold ml-1">डिग्री / विशिष्टता (Degree Name)</Label>
                 <Input value={formData.degree_diploma} onChange={e => handleInputChange('degree_diploma', e.target.value)} placeholder="उदा: B.Com, LLB, MBBS" className="rounded-2xl h-12 border-slate-200" />
               </div>
               <div className="space-y-2">
                 <Label className="text-slate-600 font-bold ml-1">व्यवसाय श्रेणी (Profession)</Label>
                 <Select value={formData.profession} onValueChange={v => handleInputChange('profession', v)}>
                    <SelectTrigger className="rounded-2xl h-12 border-slate-200 font-bold"><SelectValue placeholder="चुने" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {['Student', 'Unemployed', 'Homemaker', 'Self Employed', 'Business', 'Private Job', 'Government Job', 'Professional', 'Retired', 'Farmer', 'Other'].map(p => <SelectItem key={p} value={p} className="rounded-xl">{p}</SelectItem>)}
                    </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label className="text-slate-600 font-bold ml-1">मासिक आय (Monthly Income)</Label>
                 <Select value={formData.monthly_income} onValueChange={v => handleInputChange('monthly_income', v)}>
                    <SelectTrigger className="rounded-2xl h-12 border-slate-200 font-bold"><SelectValue placeholder="आय सीमा चुने" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {['None', 'Under 10,000', '10,000 - 25,000', '25,000 - 50,000', '50,000 - 1,00,000', 'Above 1,00,000'].map(inc => <SelectItem key={inc} value={inc} className="rounded-xl">{inc}</SelectItem>)}
                    </SelectContent>
                 </Select>
               </div>
               <div className="md:col-span-2 space-y-2">
                 <Label className="text-slate-600 font-bold ml-1">पद एवं कार्यरत संस्थान (Designation & Organization)</Label>
                 <Input value={formData.organization_company} onChange={e => handleInputChange('organization_company', e.target.value)} placeholder="उदा: Manager at SBI, Senior Teacher, Proprietor of XYZ store" className="rounded-2xl h-12 border-slate-200" />
               </div>
            </div>
          </section>

          {/* Section 3: Contact & Address */}
          <section className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
            <h3 className="text-base font-black uppercase tracking-wider text-slate-800 flex items-center gap-3 border-b pb-4">
               <div className="p-2 bg-green-50 text-green-500 rounded-xl"><MapPin className="h-5 w-5" /></div>
               3. संपर्क एवं निवास (Contact & Address)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-600 font-bold ml-1">मोबाइल नंबर (Mobile Number)</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input value={formData.mobile} onChange={e => handleInputChange('mobile', e.target.value)} className="pl-12 rounded-2xl h-12 border-slate-200 font-bold" placeholder="91XXXXXXXX" maxLength={10} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-bold ml-1">वैकल्पिक ईमेल (Email - Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="pl-12 rounded-2xl h-12 border-slate-200" placeholder="you@domain.com" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                 <Label className="text-slate-600 font-bold ml-1">फेसबुक/सोशल लिंक (Social Profile Link)</Label>
                 <Input value={formData.facebook} onChange={e => handleInputChange('facebook', e.target.value)} placeholder="facebook.com/yourprofile" className="rounded-2xl h-12 border-slate-200" />
              </div>
              <div className="md:col-span-2 space-y-2">
                 <Label className="text-slate-600 font-bold ml-1">वर्तमान पता (Current Address) <span className="text-slate-400 font-normal text-xs">(If different from Permanent)</span></Label>
                 <Textarea 
                    value={formData.current_address} 
                    onChange={e => handleInputChange('current_address', e.target.value)} 
                    placeholder="मकान नंबर, गली, मोहल्ला, शहर एवं राज्य" 
                    className="rounded-2xl border-slate-200 min-h-[100px] resize-none p-4"
                 />
              </div>
            </div>
          </section>

          {/* Section 4: Photo Gallery */}
          <section className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
            <h3 className="text-base font-black uppercase tracking-wider text-slate-800 flex items-center gap-3 border-b pb-4">
               <div className="p-2 bg-purple-50 text-purple-500 rounded-xl"><Camera className="h-5 w-5" /></div>
               4. फोटो गैलरी (Identity Photos)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               <div className="lg:col-span-4 flex flex-col items-center space-y-4">
                  <Label className="text-slate-800 font-black text-xs uppercase tracking-widest px-4 py-1.5 bg-slate-100 rounded-full">मुख्य फोटो (Profile Image) *</Label>
                  <div 
                    className="h-56 w-56 rounded-3xl border-4 border-white shadow-2xl bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden group hover:ring-2 hover:ring-primary transition-all relative group"
                    onClick={() => profileInputRef.current?.click()}
                  >
                    {profilePreview ? (
                      <>
                        <img src={profilePreview} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Profile" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="text-white h-8 w-8" />
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                         <div className="bg-slate-200 p-4 rounded-2xl mb-3"><Plus className="h-8 w-8" /></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">upload photo</span>
                      </div>
                    )}
                  </div>
                  <input ref={profileInputRef} type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'profile')} />
               </div>

               <div className="lg:col-span-8 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-slate-700 font-bold flex items-center gap-2">अतिरिक्त फोटो गैलरी (More Photos)</Label>
                    <div className="grid grid-cols-3 gap-6">
                       {[0, 1, 2].map(idx => (
                          <div 
                            key={idx}
                            className="aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden hover:bg-slate-100 hover:border-primary transition-all group"
                            onClick={() => {
                              const input = document.getElementById(`photo-${idx}`) as HTMLInputElement;
                              if (input) input.click();
                            }}
                          >
                             {photoPreviews[idx] ? (
                               <img src={photoPreviews[idx]!} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                             ) : (
                                <div className="text-center p-2">
                                   <div className="bg-slate-200 p-2 rounded-lg inline-block mb-1"><Plus className="h-4 w-4 text-slate-500" /></div>
                                   <p className="text-[8px] font-black uppercase text-slate-300">ADD {idx+1}</p>
                                </div>
                             )}
                             <input id={`photo-${idx}`} type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'photo', idx)} />
                          </div>
                       ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-6 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                       <div 
                         className="h-20 w-20 flex-none rounded-2xl border-2 border-dashed border-orange-200 bg-white flex items-center justify-center cursor-pointer overflow-hidden hover:shadow-inner transition-all"
                         onClick={() => gotraInputRef.current?.click()}
                       >
                          {gotraPreview ? (
                            <img src={gotraPreview} className="w-full h-full object-contain p-1" />
                          ) : <Droplets className="h-6 w-6 text-orange-300" />}
                       </div>
                       <div className="flex-1 space-y-1">
                          <Label className="text-orange-900 font-black text-xs uppercase cursor-pointer" onClick={() => gotraInputRef.current?.click()}>गोत्र प्रमाण/फोटो (Gotra Certificate/Symbol)</Label>
                          <p className="text-[10px] text-orange-600 leading-tight">यदि गोत्र का कोई विशेष चिन्ह या प्रमाण पत्र हो तो यहाँ सलग्न करें। (If any specific symbol/certificate exists)</p>
                          <Button variant="outline" className="h-8 rounded-lg text-[10px] border-orange-200 bg-white text-orange-700 hover:bg-orange-50 font-bold mt-2 px-3" onClick={() => gotraInputRef.current?.click()}>
                             {gotraPreview ? "Change Image" : "Select Image"}
                          </Button>
                       </div>
                    </div>
                    <input ref={gotraInputRef} type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'gotra')} />
                  </div>
               </div>
            </div>
          </section>
        </div>

        {/* Sticky Fixed Footer */}
        <footer className="flex-none p-6 bg-white border-t-2 border-slate-100 flex flex-col sm:flex-row gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-50">
           <Button 
              variant="outline" 
              className="flex-1 h-14 rounded-2xl text-slate-500 font-black uppercase tracking-widest text-xs border-slate-200 hover:bg-slate-50" 
              onClick={onClose} 
              disabled={loading}
           >
              रद्द करें (Cancel)
           </Button>
           <Button 
              className="flex-[2] h-14 rounded-2xl text-lg font-black font-heading shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all text-white" 
              onClick={handleSubmit} 
              disabled={loading}
           >
              {loading ? "सुरक्षित किया जा रहा है..." : memberData ? "अपडेट करें (Save Changes)" : "सदस्य सहेजें (Save & Close)"}
           </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
