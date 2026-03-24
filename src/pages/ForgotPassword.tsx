import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Hexagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const { toast } = useToast();
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); toast({ title: "Reset link sent (demo)" }); };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card-strong">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4"><div className="p-3 rounded-xl bg-primary/10"><Hexagon className="h-8 w-8 text-primary" /></div></div>
          <CardTitle className="text-2xl font-heading">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Email</Label><Input type="email" placeholder="you@example.com" required /></div>
            <Button type="submit" className="w-full">Send Reset Link</Button>
            <p className="text-center text-sm text-muted-foreground"><Link to="/login" className="text-primary hover:underline">Back to Sign In</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
