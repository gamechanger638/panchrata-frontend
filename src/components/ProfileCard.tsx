import { Member } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileCardProps {
  member: Member;
  showMatchButton?: boolean;
}

export function ProfileCard({ member, showMatchButton = false }: ProfileCardProps) {
  return (
    <Card className="glass-card hover-lift overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <img src={member.photo} alt={member.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-border" />
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-semibold text-foreground truncate">{member.name}</h4>
            <p className="text-sm text-muted-foreground">{member.age} yrs • {member.city}</p>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              <Badge variant="secondary" className="text-xs">{member.education}</Badge>
              <Badge variant="outline" className="text-xs">{member.profession}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/dashboard/members/${member.id}`}><Eye className="h-3.5 w-3.5 mr-1" /> View</Link>
          </Button>
          {showMatchButton && (
            <Button size="sm" className="flex-1">
              <Heart className="h-3.5 w-3.5 mr-1" /> Send Request
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
