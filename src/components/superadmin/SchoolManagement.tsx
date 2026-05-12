import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, Plus, Search, MoreVertical, 
  Mail, MapPin, Loader2, Trash2, Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const SchoolManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({ name: "", address: "", contact_email: "" });

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ["superadmin-schools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("*").order("name");
      if (error) throw error;
      return data || [];
    }
  });

  const addSchoolMutation = useMutation({
    mutationFn: async (newSchool: typeof formData) => {
      const { data, error } = await supabase.from("schools").insert([newSchool]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-schools"] });
      toast({ title: "School added successfully" });
      setIsAdding(false);
      setFormData({ name: "", address: "", contact_email: "" });
    },
    onError: (err: any) => {
      toast({ title: "Error adding school", description: err.message, variant: "destructive" });
    }
  });

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search schools..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <Plus className="w-4 h-4" />
          {isAdding ? "Cancel" : "Add School"}
        </Button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="card-warm p-6 border-primary/20 bg-primary/5"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">School Name</label>
              <Input 
                placeholder="e.g. Tbilisi Public School #1" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Email</label>
              <Input 
                type="email"
                placeholder="admin@school.ge" 
                value={formData.contact_email}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address</label>
              <Input 
                placeholder="Street name, City" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button 
              disabled={addSchoolMutation.isPending || !formData.name}
              onClick={() => addSchoolMutation.mutate(formData)}
            >
              {addSchoolMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save School
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))
        ) : filteredSchools.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No schools found.
          </div>
        ) : (
          filteredSchools.map((school) => (
            <div key={school.id} className="card-warm p-5 hover:border-primary/30 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="w-8 h-8"><Edit2 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <h4 className="font-heading font-bold text-foreground mb-3">{school.name}</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  {school.contact_email || "No email"}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {school.address || "No address"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import { motion } from "framer-motion";
export default SchoolManagement;
