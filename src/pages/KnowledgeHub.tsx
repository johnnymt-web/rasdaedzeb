import { motion } from "framer-motion";
import { Search, Book, FileText, Loader2, Library, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function KnowledgeHub() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["knowledge-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_resources")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const filteredResources = resources.filter((r: any) => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(resources.map((r: any) => r.category)));

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
              <Library className="w-8 h-8 text-primary" />
              Knowledge Hub
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Access curated articles, guides, and tools for career planning and transition support.
            </p>
          </div>

          <div className="relative max-w-xl mb-10">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <Input 
              type="text" 
              className="pl-10 h-12 bg-background shadow-sm border-border" 
              placeholder="Search by topic, e.g. Resume, Trade School..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : resources.length === 0 ? (
            <div className="card-warm p-12 text-center">
              <Book className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
              <h2 className="text-xl font-heading font-semibold text-foreground mb-2">No Resources Found</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                The school administration has not uploaded any knowledge articles yet. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-8">
              
              {/* Sidebar Categories */}
              <div className="hidden lg:block space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Topics</h3>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start font-normal ${searchQuery === '' ? 'bg-muted/50 font-medium' : ''}`}
                  onClick={() => setSearchQuery('')}
                >
                  All Topics
                </Button>
                {categories.map((cat: any) => (
                  <Button 
                    key={cat}
                    variant="ghost" 
                    className={`w-full justify-start font-normal ${searchQuery.toLowerCase() === cat.toLowerCase() ? 'bg-muted/50 font-medium' : ''}`}
                    onClick={() => setSearchQuery(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Main Content List */}
              <div className="lg:col-span-3 space-y-4">
                {filteredResources.length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground">No matching resources found for "{searchQuery}".</p>
                ) : (
                  filteredResources.map((resource: any) => (
                    <div key={resource.id} className="card-interactive p-5 flex items-start gap-4 hover:border-primary/40 transition-colors group">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                          {resource.category}
                        </div>
                        <h3 className="text-lg font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-foreground/80 line-clamp-2">
                          {resource.content}
                        </p>
                      </div>
                      <div className="shrink-0 self-center">
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </motion.div>
    </div>
  );
}
