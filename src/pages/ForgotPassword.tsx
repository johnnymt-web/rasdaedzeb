import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Compass, ArrowLeft, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast({
        title: "Something went wrong",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 surface-sage items-center justify-center p-12">
        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Compass className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">Pathfinder</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground leading-tight">
            No worries.<br />
            We'll help you get back in.
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-heading font-bold text-foreground">Pathfinder</span>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-foreground">Check your email</h2>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>. 
                Click the link in the email to set a new password.
              </p>
              <p className="text-xs text-muted-foreground">
                Didn't receive it? Check your spam folder or{" "}
                <button onClick={() => setSent(false)} className="text-primary font-medium hover:underline">
                  try again
                </button>.
              </p>
              <Link to="/auth">
                <Button variant="outline" size="sm" className="mt-2">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-heading font-bold text-foreground">Forgot your password?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.edu"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Sending…" : "Send reset link"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/auth" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
