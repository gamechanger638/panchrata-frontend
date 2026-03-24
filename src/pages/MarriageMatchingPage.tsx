import { useState } from "react";
import { members, cities, educations, professions, gotras, panchratnaCategories } from "@/data/dummyData";
import { ProfileCard } from "@/components/ProfileCard";
import { SearchFilters } from "@/components/SearchFilters";

export default function MarriageMatchingPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const unmarried = members.filter(m => m.maritalStatus === "Unmarried");

  const filtered = unmarried.filter(m => {
    const s = search.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(s);
    const matchGender = !filters.gender || filters.gender === "all" || m.gender === filters.gender;
    const matchCity = !filters.city || filters.city === "all" || m.city === filters.city;
    const matchEdu = !filters.education || filters.education === "all" || m.education === filters.education;
    const matchProf = !filters.profession || filters.profession === "all" || m.profession === filters.profession;
    const matchGotra = !filters.gotra || filters.gotra === "all" || m.gotra === filters.gotra;
    const matchCat = !filters.panchratna || filters.panchratna === "all" || m.panchratnaCategory === filters.panchratna;
    return matchSearch && matchGender && matchCity && matchEdu && matchProf && matchGotra && matchCat;
  });

  const filterOptions = [
    { label: "Gender", value: "gender", options: [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }] },
    { label: "City", value: "city", options: cities.map(c => ({ label: c, value: c })) },
    { label: "Education", value: "education", options: educations.map(e => ({ label: e, value: e })) },
    { label: "Profession", value: "profession", options: professions.map(p => ({ label: p, value: p })) },
    { label: "Gotra", value: "gotra", options: gotras.map(g => ({ label: g, value: g })) },
    { label: "Category", value: "panchratna", options: panchratnaCategories.map(c => ({ label: c, value: c })) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Marriage Matching</h1>
        <p className="text-sm text-muted-foreground mt-1">Find potential matches for unmarried members</p>
      </div>

      <SearchFilters
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onReset={() => { setSearch(""); setFilters({}); }}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(m => <ProfileCard key={m.id} member={m} showMatchButton />)}
      </div>
      {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No matching profiles found</p>}
    </div>
  );
}
