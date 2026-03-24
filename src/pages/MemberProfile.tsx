import { useParams, Link } from "react-router-dom";
import { members, families } from "@/data/dummyData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Phone, MapPin, BookOpen, Briefcase, Heart, Droplets, Users } from "lucide-react";

export default function MemberProfile() {
  const { id } = useParams();
  const member = members.find(m => m.id === id);
  if (!member) return <div className="p-8 text-center text-muted-foreground">Member not found</div>;
  const family = families.find(f => f.id === member.familyId);
  const familyMembers = members.filter(m => m.familyId === member.familyId && m.id !== member.id);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" asChild><Link to="/dashboard/members"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>

      <Card className="glass-card overflow-hidden">
        <div className="gradient-hero p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <img src={member.photo} alt={member.name} className="h-24 w-24 rounded-full ring-4 ring-white/20" />
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-heading font-bold text-primary-foreground">{member.name}</h1>
            <p className="text-primary-foreground/80 mt-1">{member.profession} • {member.education}</p>
            <div className="flex gap-2 mt-3 justify-center md:justify-start">
              <Badge className="bg-white/20 text-white border-0">{member.panchratnaCategory}</Badge>
              <Badge className="bg-white/20 text-white border-0">{member.maritalStatus}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base font-heading">Personal Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Users, label: "Father", value: member.fatherName },
              { icon: Users, label: "Mother", value: member.motherName },
              { icon: Heart, label: "Age", value: `${member.age} years` },
              { icon: Users, label: "Gender", value: member.gender },
              { icon: Droplets, label: "Blood Group", value: member.bloodGroup },
              { icon: BookOpen, label: "Gotra", value: member.gotra },
              { icon: Phone, label: "Mobile", value: member.mobile },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground w-24">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base font-heading">Education & Career</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: BookOpen, label: "Education", value: member.education },
              { icon: Briefcase, label: "Profession", value: member.profession },
              { icon: MapPin, label: "City", value: member.city },
              { icon: MapPin, label: "State", value: member.state },
              { icon: MapPin, label: "Address", value: member.address },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground w-24">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {family && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base font-heading">Family: {family.familyHead}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{family.city}, {family.state} • {family.panchratnaCategory}</p>
            {familyMembers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Other Family Members</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {familyMembers.map(fm => (
                    <Link key={fm.id} to={`/dashboard/members/${fm.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border">
                      <img src={fm.photo} alt={fm.name} className="h-9 w-9 rounded-full ring-1 ring-border" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{fm.name}</p>
                        <p className="text-xs text-muted-foreground">{fm.age} yrs • {fm.gender}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
