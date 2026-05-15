import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function OnetAssessment() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const rawGrade = profile?.grade || user?.user_metadata?.grade || "7";
  const numericGrade = parseInt(rawGrade.toString().replace(/\D/g, "")) || 7;

  useEffect(() => {
    if (numericGrade < 11) {
      toast.error("This assessment is recommended for grades 11 and above.");
      navigate("/student/assessment");
    }
  }, [numericGrade, navigate]);
  useEffect(() => {
    // Dynamically load the O*NET script
    const script = document.createElement("script");
    script.src = "https://services.onetcenter.org/embed/onet-ip.js?x-api-key=BpXjS-26uyT-RkyAO-6PRRf";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove the script when component unmounts
      document.body.removeChild(script);
      // Also clean up any global O*NET objects if they exist
      if ((window as any).onet_ip) {
        delete (window as any).onet_ip;
      }
    };
  }, []);

  return (
    <div className="space-y-8">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/student/assessment">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Discovery Hub
            </Button>
          </Link>
          <a 
            href="https://www.mynextmove.org/explore/ip" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            Open on O*NET <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }}
          className="card-warm p-4 md:p-8 border border-border bg-card shadow-xl rounded-3xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">Official O*NET Interest Profiler</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find out what your interests are and how they relate to the world of work. 
              This is the official tool from the U.S. Department of Labor.
            </p>
          </div>

          {/* The O*NET Widget Container */}
          <div className="embed-onet-ip min-h-[600px] w-full rounded-xl overflow-hidden bg-white/50">
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground italic">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              Loading Official Assessment...
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="text-sm text-primary/80 leading-relaxed">
              <strong>Note:</strong> This assessment is provided by O*NET. Your results from this specific widget 
              are not automatically saved to our database. We recommend taking a screenshot of your scores 
              or using our native Discovery tool if you want your results tracked in your portfolio.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 text-center">
            <div className="flex flex-col items-center gap-4">
              <a href="https://services.onetcenter.org/" target="_blank" rel="noopener noreferrer" title="This site incorporates information from O*NET Web Services. Click to learn more.">
                <img src="https://www.onetcenter.org/image/link/onet-in-it.svg" className="w-32 h-auto" alt="O*NET in-it" />
              </a>
              <p className="text-[10px] text-muted-foreground max-w-xl leading-relaxed">
                This site incorporates information from <a href="https://services.onetcenter.org/" className="underline hover:text-primary">O*NET Web Services</a> by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). O*NET® is a trademark of USDOL/ETA.
              </p>
            </div>
          </div>
        </motion.div>
    </div>
  );
}
