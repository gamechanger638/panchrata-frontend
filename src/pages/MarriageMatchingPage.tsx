import { useState, useEffect } from "react";
import { getMembers } from "@/services/membersApi";
import { ProfileCard } from "@/components/ProfileCard";
import { SearchFilters } from "@/components/SearchFilters";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/services/api";

import { cities as dummyCities, educations as dummyEducations, professions as dummyProfessions, gotras as dummyGotras, panchratnaCategories as dummyCategories } from "@/data/dummyData";

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

export default function MarriageMatchingPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const memRes = await getMembers();
        const allMembers = memRes.data.results || memRes.data || [];
        
        const baseUrl = API_BASE_URL.replace('/api', '');
        
        // Map backend members to frontend Member type
        const mappedMembers = allMembers.map((m: any) => ({
          id: m.id,
          name: m.name,
          dob: m.dob,
          age: calculateAge(m.dob),
          city: m.district_name || "N/A",
          education: m.education || "Other",
          profession: m.profession || "Other",
          maritalStatus: m.marital_status === "unmarried" ? "Unmarried" : "Married",
          photo: m.profile_image ? (m.profile_image.startsWith('http') ? m.profile_image : `${baseUrl}${m.profile_image}`) : avatarUrl(m.name || "User"),
          gotraImage: m.gotra_image ? (m.gotra_image.startsWith('http') ? m.gotra_image : `${baseUrl}${m.gotra_image}`) : null,
          gotra: m.family_gotra || "N/A",
          gender: m.gender || "Male",
          height: m.height || "N/A",
          colour: m.colour || "N/A",
          panchratnaCategory: "Manu"
        }));


        setMembers(mappedMembers);
      } catch (e: any) {
        console.error(e);
        toast({ title: "Error fetching data", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const unmarried = members.filter(m => m.maritalStatus === "Unmarried");

  const filtered = unmarried.filter(m => {
    const s = search.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(s);
    const matchGender = !filters.gender || filters.gender === "all" || m.gender === filters.gender;
    const matchCity = !filters.city || filters.city === "all" || m.city === filters.city;
    const matchEdu = !filters.education || filters.education === "all" || (m.education || "").toLowerCase() === (filters.education || "").toLowerCase();
    const matchProf = !filters.profession || filters.profession === "all" || (m.profession || "").toLowerCase() === (filters.profession || "").toLowerCase();
    const matchGotra = !filters.gotra || filters.gotra === "all" || (m.gotra || "").toLowerCase() === (filters.gotra || "").toLowerCase();
    const matchCat = !filters.panchratna || filters.panchratna === "all" || m.panchratnaCategory === filters.panchratna;
    return matchSearch && matchGender && matchCity && matchEdu && matchProf && matchGotra && matchCat;
  });

  // Extract unique options from actual data for filters
  const availableCities = Array.from(new Set(members.map(m => m.city).filter(Boolean)));
  const availableEducations = Array.from(new Set(members.map(m => m.education).filter(Boolean)));
  const availableProfessions = Array.from(new Set(members.map(m => m.profession).filter(Boolean)));
  const availableGotras = Array.from(new Set(members.map(m => m.gotra).filter(Boolean)));

  const filterOptions = [
    { label: "Gender", value: "gender", options: [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }] },
    { label: "City", value: "city", options: availableCities.map(c => ({ label: c, value: c })) },
    { label: "Education", value: "education", options: availableEducations.map(e => ({ label: e, value: e })) },
    { label: "Profession", value: "profession", options: availableProfessions.map(p => ({ label: p, value: p })) },
    { label: "Gotra", value: "gotra", options: availableGotras.map(g => ({ label: g, value: g })) },
    { label: "Category", value: "panchratna", options: dummyCategories.map(c => ({ label: c, value: c })) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Marriage Matching</h1>
          <p className="text-sm text-muted-foreground mt-1">Find potential matches for unmarried members in your geographical area</p>
        </div>
      </div>

      <SearchFilters
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onReset={() => { setSearch(""); setFilters({}); }}
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(m => <ProfileCard key={m.id} member={m} showMatchButton />)}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">No matching unmarried profiles found in your area.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
