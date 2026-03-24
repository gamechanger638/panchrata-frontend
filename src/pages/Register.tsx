import { useState } from "react";
import { API_BASE_URL } from "@/services/api";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Hexagon } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setError("");
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || data.mobile?.[0] || "Registration failed");
      }

      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card-strong">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4"><div className="p-3 rounded-xl bg-primary/10"><Hexagon className="h-8 w-8 text-primary" /></div></div>
          <CardTitle className="text-2xl font-heading">Create Account</CardTitle>
          <CardDescription>Join the Panchratna Vishwakarma Census</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div><Label>Full Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required /></div>
            <div><Label>Mobile</Label><Input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Mobile number" required /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Registering..." : "Register"}</Button>
            <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
