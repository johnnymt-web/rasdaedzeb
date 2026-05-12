import { motion } from "framer-motion";
import { Briefcase, Building2, Calendar, Link as LinkIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const TYPE_COLORS = {
  internship: "bg-primary/10 text-primary border-primary/20",
  shadowing: "bg-secondary/10 text-secondary border-secondary/20",
  career_fair: "bg-accent/10 text-accent border-accent/20",
  mentorship: "bg-sage-600/10 text-sage-600 border-sage-600/20"
};

export default function Opportunities() {
  const { user } = useAuth();

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-primary" />
              Opportunity Hub
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Explore real-world experiences, internships, and shadowing opportunities provided by your school's partners.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : opportunities.length === 0 ? (
            <div className="card-warm p-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
              <h2 className="text-xl font-heading font-semibold text-foreground mb-2">No Opportunities Right Now</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Check back later as new internships, shadowing programs, and career fairs are posted throughout the year!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {opportunities.map((opp: any) => (
                <div key={opp.id} className="card-interactive p-5 flex flex-col h-full border hover:border-primary/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md border ${TYPE_COLORS[opp.type as keyof typeof TYPE_COLORS] || "bg-muted text-muted-foreground"}`}>
                      {opp.type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
                    {opp.title}
                  </h3>
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-3">
                    <Building2 className="w-4 h-4" />
                    {opp.company_name}
                  </div>
                  
                  <p className="text-sm text-foreground/80 mb-4 flex-1 line-clamp-3">
                    {opp.description}
                  </p>
                  
                  <div className="pt-4 mt-auto border-t border-border flex items-center justify-between">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {opp.deadline ? `Closes ${new Date(opp.deadline).toLocaleDateString()}` : 'Ongoing'}
                    </div>
                    {opp.application_url && (
                      <Button size="sm" variant="outline" className="h-8" onClick={() => window.open(opp.application_url, "_blank")}>
                        <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
    </div>
  );
}
