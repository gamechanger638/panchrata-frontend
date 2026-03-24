import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base font-heading">Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Current Password</Label><Input type="password" placeholder="••••••••" /></div>
          <div><Label>New Password</Label><Input type="password" placeholder="••••••••" /></div>
          <div><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" /></div>
          <Button onClick={() => toast({ title: "Password updated (demo)" })}>Update Password</Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base font-heading">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Email Notifications", desc: "Receive email updates about new members" },
            { label: "Match Alerts", desc: "Get notified about new marriage match requests" },
            { label: "Community Updates", desc: "Stay informed about community events" },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base font-heading">Privacy</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Public Profile", desc: "Allow others to view your profile" },
            { label: "Show Contact Info", desc: "Display phone number in directory" },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
