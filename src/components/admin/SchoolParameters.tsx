import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, GraduationCap, Bell, Save, 
  RotateCcw, Info
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Settings {
  startYear: string;
  endYear: string;
  assessmentStart: string;
  assessmentEnd: string;
  counselorAlerts: boolean;
  minGrade: string;
  maxGrade: string;
}

const DEFAULT_SETTINGS: Settings = {
  startYear: "2025/26",
  endYear: "2026/27",
  assessmentStart: "2025-09-01",
  assessmentEnd: "2026-06-30",
  counselorAlerts: true,
  minGrade: "Year 9",
  maxGrade: "Year 13",
};

export default function SchoolParameters() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("school_parameters");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("school_parameters", JSON.stringify(settings));
    setIsChanged(false);
    toast.success(t("settings.school.save_success"));
  };

  const update = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsChanged(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            {t("settings.school.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("settings.school.desc")}
          </p>
        </div>
        {isChanged && (
          <div className="flex gap-2 animate-in zoom-in duration-300">
            <Button variant="ghost" size="sm" onClick={() => { setSettings(DEFAULT_SETTINGS); setIsChanged(true); }}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t("settings.school.reset")}
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-2 bg-secondary hover:bg-secondary/90">
              <Save className="w-4 h-4" />
              {t("settings.school.save")}
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Section 1: Assessment Cycle */}
        <div className="card-warm p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">{t("settings.school.assessment_cycle")}</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-foreground/70 ml-1">{t("settings.school.year_start")}</label>
                <Input 
                  value={settings.startYear} 
                  onChange={e => update("startYear", e.target.value)}
                  className="bg-background/50 border-transparent focus:border-secondary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-foreground/70 ml-1">{t("settings.school.next_cycle")}</label>
                <Input 
                   value={settings.endYear} 
                   onChange={e => update("endYear", e.target.value)}
                   className="bg-background/50 border-transparent focus:border-secondary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-foreground/70 ml-1">{t("settings.school.window")}</label>
              <div className="flex items-center gap-2">
                <Input 
                  type="date"
                  value={settings.assessmentStart} 
                  onChange={e => update("assessmentStart", e.target.value)}
                  className="bg-background/50 border-transparent focus:border-secondary"
                />
                <span className="text-muted-foreground text-xs uppercase font-bold">{t("common.to")}</span>
                <Input 
                  type="date"
                  value={settings.assessmentEnd} 
                  onChange={e => update("assessmentEnd", e.target.value)}
                  className="bg-background/50 border-transparent focus:border-secondary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Student Range & Alerts */}
        <div className="card-warm p-6 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t("settings.school.scope")}</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-transparent hover:border-border transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold font-heading">{t("settings.school.alerts")}</div>
                  <div className="text-[10px] text-muted-foreground">{t("settings.school.alerts_desc")}</div>
                </div>
              </div>
              <button 
                onClick={() => update("counselorAlerts", !settings.counselorAlerts)}
                className={`w-10 h-5 rounded-full transition-colors relative ${settings.counselorAlerts ? 'bg-secondary' : 'bg-muted'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.counselorAlerts ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t("settings.school.grade_span")}</span>
              </div>
              <div className="flex gap-2 items-center">
                <Input 
                  placeholder={t("settings.school.min_grade")} 
                  value={settings.minGrade} 
                  onChange={e => update("minGrade", e.target.value)}
                  className="text-xs h-8 bg-background/50"
                />
                <span className="text-muted-foreground">→</span>
                <Input 
                   placeholder={t("settings.school.max_grade")}
                   value={settings.maxGrade} 
                   onChange={e => update("maxGrade", e.target.value)}
                   className="text-xs h-8 bg-background/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-sky-200/50 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-sky-900 mb-1 font-heading">{t("settings.school.policy_title")}</h4>
          <p className="text-[10px] text-sky-800 leading-relaxed font-medium">
            {t("settings.school.policy_desc")}
          </p>
        </div>
      </div>
    </div>
  );
}
