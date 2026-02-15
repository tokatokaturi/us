import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader, Mail, Lock, Chrome } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const nav = useNavigate();
  const { login, googleLogin } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(form.email, form.password);
      toast.success("Login successful!");
      nav("/");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try {
      setIsLoading(true);

      // Get user profile from Google using access_token
      const res = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
      );

      const user = await res.json();

      await googleLogin(
        user.sub,
        user.email,
        user.name
      );

      toast.success("Google login successful!");
      nav("/");
    } catch (error) {
      toast.error("Google login failed");
    } finally {
      setIsLoading(false);
    }
  },
  onError: () => {
    toast.error("Google login failed");
  },
});


  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <div className="p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-white font-display">Welcome Back</h1>
            <p className="text-zinc-400">Sign in to your account</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-zinc-500 h-5 w-5" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-zinc-500 h-5 w-5" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white h-11 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-zinc-900 text-zinc-400">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={() => handleGoogleLogin()}
            disabled={isLoading}
            variant="outline"
            className="w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Google
          </Button>

          <p className="text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-amber-600 hover:text-amber-500 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
