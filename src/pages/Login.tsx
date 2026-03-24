import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Hexagon } from "lucide-react";
import { login as authLogin } from "@/services/authApi";
import { useAuth } from "@/context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authLogin({ email, password });
      const { access, refresh } = response.data;
      localStorage.setItem("refreshToken", refresh);
      login(access);

      // Decode role and navigate to role-specific dashboard
      const decoded: { role: string } = jwtDecode(access);
      const target = `/${decoded.role.replace('_', '-')}`;
      navigate(target, { replace: true });

    } catch (err: any) {
      if (!err.response) {
        setError("Network Error: The backend might be waking up (it sleeps after 15 mins of inactivity). Please wait ~30 seconds and try again.");
      } else {
        setError(err.response?.data?.detail || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card-strong">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Hexagon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading">Panchratna Census</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
            <div className="text-center text-sm">
              <p className="text-muted-foreground">Only super admins can register users.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
