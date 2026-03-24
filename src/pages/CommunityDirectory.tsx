import { useState } from "react";
import { members, cities, educations, professions, panchratnaCategories } from "@/data/dummyData";
import { ProfileCard } from "@/components/ProfileCard";
import { SearchFilters } from "@/components/SearchFilters";

export default function CommunityDirectory() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = members.filter(m => {
    const s = search.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(s) || m.mobile.includes(s);
    const matchCity = !filters.city || filters.city === "all" || m.city === filters.city;
    const matchEdu = !filters.education || filters.education === "all" || m.education === filters.education;
    const matchStatus = !filters.maritalStatus || filters.maritalStatus === "all" || m.maritalStatus === filters.maritalStatus;
    const matchCat = !filters.panchratna || filters.panchratna === "all" || m.panchratnaCategory === filters.panchratna;
    return matchSearch && matchCity && matchEdu && matchStatus && matchCat;
  });

  const filterOptions = [
    { label: "City", value: "city", options: cities.map(c => ({ label: c, value: c })) },
    { label: "Education", value: "education", options: educations.map(e => ({ label: e, value: e })) },
    { label: "Marital Status", value: "maritalStatus", options: ["Unmarried", "Married", "Divorced", "Widowed"].map(s => ({ label: s, value: s })) },
    { label: "Category", value: "panchratna", options: panchratnaCategories.map(c => ({ label: c, value: c })) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Community Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">Searchable directory of all community members</p>
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
        {filtered.map(m => <ProfileCard key={m.id} member={m} />)}
      </div>
      {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No members found</p>}
    </div>
  );
}
