import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { user, profile } = useAuth();

  // Sync language with profile preference on load
  useEffect(() => {
    if (profile?.preferred_language && profile.preferred_language !== i18n.language) {
      i18n.changeLanguage(profile.preferred_language);
      document.documentElement.lang = profile.preferred_language;
    }
  }, [profile, i18n]);

  const toggleLanguage = async (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    
    // Save to DB if user is logged in
    if (user) {
      await supabase
        .from("profiles")
        .update({ preferred_language: lng } as any)
        .eq("id", user.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <Languages className="w-4 h-4" />
          <span className="hidden sm:inline">
            {i18n.language === "ka" ? "ქართული" : "English"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toggleLanguage("en")} className="cursor-pointer">
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toggleLanguage("ka")} className="cursor-pointer">
          ქართული
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
