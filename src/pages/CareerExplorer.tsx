import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ChevronRight, Search, Scale, GraduationCap,
  Briefcase, TrendingUp, BookOpen, X, Sparkles, Target
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams } from "react-router-dom";
import { careerFamilies, CareerFamily, Profession } from "@/data/careerFamilies";
import PathwayComparison from "@/components/explore/PathwayComparison";
import { useTranslation } from "react-i18next";
import { fetchOnetData, getCareerDetail, OnetCareer } from "@/services/onetService";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Loader2, MapPin } from "lucide-react";

type View = "grid" | "detail" | "compare";

export default function CareerExplorer() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<View>("grid");
  const [selectedFamily, setSelectedFamily] = useState<CareerFamily | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [compareItems, setCompareItems] = useState<Profession[]>([]);
  const [selectedOnetCode, setSelectedOnetCode] = useState<string | null>(null);

  const { data: onetSearchResults, isLoading: isSearchingOnet, error: onetSearchError } = useQuery({
    queryKey: ["onet-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 3) return [];
      const data = await fetchOnetData("/mnm/search", { keyword: searchQuery });
      return data.career?.slice(0, 5) || [];
    },
    enabled: searchQuery.length >= 3,
  });

  const { data: careerDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["onet-career-detail", selectedOnetCode],
    queryFn: () => getCareerDetail(selectedOnetCode!),
    enabled: !!selectedOnetCode,
  });

  const filteredFamilies = careerFamilies.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.professions.some((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openFamily = (family: CareerFamily) => {
    setSelectedFamily(family);
    setView("detail");
  };

  const toggleCompare = (profession: Profession) => {
    setCompareItems((prev) => {
      const exists = prev.find((p) => p.title === profession.title);
      if (exists) return prev.filter((p) => p.title !== profession.title);
      if (prev.length >= 3) return prev;
      return [...prev, profession];
    });
  };

  const isInCompare = (title: string) => compareItems.some((p) => p.title === title);

  return (
    <div className="space-y-8">
      <div className="max-w-6xl mx-auto">
        {/* Back nav */}
        <div className="mb-6">
          {view === "grid" ? (
            <Link
              to="/student"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("explorer.back")}
            </Link>
          ) : (
            <button
              onClick={() => { setView("grid"); setSelectedFamily(null); }}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("explorer.back_all")}
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {view === "grid" && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                  {t("explorer.title")}
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  {t("explorer.desc")}
                </p>
              </div>

              {/* Search */}
              <div className="relative max-w-md mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("explorer.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Career family grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFamilies.map((family, i) => (
                  <motion.button
                    key={family.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => openFamily(family)}
                    className={`card-interactive p-6 text-left ${family.surfaceClass}`}
                  >
                    <div className="text-3xl mb-3">{family.emoji}</div>
                    <h3 className="font-heading font-bold text-foreground mb-1">
                      {t(`career_families.${family.id}.name`)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t(`career_families.${family.id}.tagline`)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={family.badgeClass}>
                        {family.code} — {
                          family.code === "R" ? t("riasec.Realistic") : 
                          family.code === "I" ? t("riasec.Investigative") : 
                          family.code === "A" ? t("riasec.Artistic") : 
                          family.code === "S" ? t("riasec.Social") : 
                          family.code === "E" ? t("riasec.Enterprising") : 
                          t("riasec.Conventional")
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <span>{family.professions.length} {t("explorer.professions")}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* O*NET results if searching */}
                <div className="mt-12 pb-8 border-b border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="font-heading font-semibold text-lg">{t("assessment_results.onet.title")}</h2>
                  </div>
                  {isSearchingOnet ? (
                    <div className="flex py-8 justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : onetSearchError ? (
                    <div className="p-6 text-center bg-destructive/5 rounded-xl border border-destructive/20 mb-6">
                      <p className="text-sm text-destructive font-medium mb-1">{t("explorer.onet_error")}</p>
                      <p className="text-xs text-muted-foreground">{(onetSearchError as Error).message || t("assessment_results.onet.error")}</p>
                    </div>
                  ) : (
                    <>
                      {onetSearchResults && onetSearchResults.length > 0 ? (
                        <div className="grid gap-3 mb-6">
                          {onetSearchResults.map((career: any) => (
                            <button
                              key={career.code}
                              onClick={() => setSelectedOnetCode(career.code)}
                              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-left group"
                            >
                              <div>
                                <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                                  {career.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{t("explorer.onet_desc")}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      ) : searchQuery.length >= 3 ? (
                        <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border mb-6">
                          <p className="text-sm text-muted-foreground">{t("explorer.no_match", { query: searchQuery })}</p>
                        </div>
                      ) : null}
                      
                      <div className="flex flex-col items-center gap-2 pt-4 border-t border-border/30">
                        <a href="https://services.onetcenter.org/" target="_blank" rel="noopener noreferrer" title="This site incorporates information from O*NET Web Services. Click to learn more.">
                          <img src="https://www.onetcenter.org/image/link/onet-in-it.svg" className="w-24 h-auto opacity-50 hover:opacity-100 transition-opacity" alt="O*NET in-it" />
                        </a>
                        <p className="text-[9px] text-muted-foreground text-center leading-relaxed">
                          {t("explorer.onet_disclaimer")}
                        </p>
                      </div>
                    </>
                  )}
                </div>

              {filteredFamilies.length === 0 && (!onetSearchResults || onetSearchResults.length === 0) && (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-lg mb-2">{t("explorer.no_match", { query: searchQuery })}</p>
                  <p className="text-sm">{t("explorer.try_different")}</p>
                </div>
              )}

              {/* O*NET Detail Modal */}
              <Dialog open={!!selectedOnetCode} onOpenChange={(open) => !open && setSelectedOnetCode(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  {isLoadingDetail ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : careerDetail ? (
                    <div className="space-y-6">
                      <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                          <DialogTitle className="text-2xl font-heading font-bold text-foreground">
                            {careerDetail.title}
                          </DialogTitle>
                          {careerDetail.outlook && (
                            <Badge 
                              variant="secondary" 
                              className={
                                careerDetail.outlook === 'Bright Outlook' 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : careerDetail.outlook === 'Average'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-slate-100 text-slate-700'
                              }
                            >
                              {t(`assessment_results.onet.outlook.${careerDetail.outlook}`, careerDetail.outlook)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {careerDetail.description}
                        </p>
                      </DialogHeader>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                              <Briefcase className="w-4 h-4 text-primary" /> {t("assessment_results.onet.key_tasks")}
                            </h4>
                            <ul className="space-y-1.5">
                              {careerDetail.tasks?.map((task, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                                  <span className="text-primary">•</span> {task}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                              <TrendingUp className="w-4 h-4 text-secondary" /> {t("assessment_results.onet.top_skills")}
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {careerDetail.skills?.map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] font-medium">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                              <GraduationCap className="w-4 h-4 text-amber-500" /> {t("assessment_results.onet.education")}
                            </h4>
                            <div className="space-y-1.5">
                              {careerDetail.education?.map((edu, i) => (
                                <div key={i} className="text-xs text-muted-foreground p-2 rounded bg-muted/50">
                                  {edu}
                                </div>
                              ))}
                            </div>
                          </div>

                          {careerDetail.personality && (
                            <div>
                              <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                                <Target className="w-4 h-4 text-rose-500" /> {t("assessment.riasec.title")}
                              </h4>
                              <p className="text-xs text-muted-foreground p-2 rounded bg-rose-500/10 border border-rose-500/20">
                                {careerDetail.personality}
                              </p>
                            </div>
                          )}


                          <div className="p-4 rounded-xl surface-sage border border-primary/10">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                              <MapPin className="w-4 h-4 text-primary" /> {t("assessment_results.onet.salary_insight")}
                            </h4>
                            <p className="text-xs text-foreground/80 mb-2">
                              {careerDetail.salary_range 
                                ? t("assessment_results.onet.median_salary", { salary: careerDetail.salary_range }) 
                                : t("assessment_results.onet.salary_fallback")}
                            </p>
                            <p className="text-[10px] text-muted-foreground italic">
                              {t("assessment_results.onet.national_averages")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="outline" size="sm" onClick={() => setSelectedOnetCode(null)}>
                          {t("common.close")}
                        </Button>
                        <Button size="sm" asChild>
                          <a 
                            href={`https://www.onetonline.org/link/summary/${careerDetail.code}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="gap-1.5"
                          >
                            {t("assessment_results.onet.view_on_onet")} <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      </div>

                      <div className="flex flex-col items-center gap-2 pt-6 border-t border-border mt-4">
                        <a href="https://services.onetcenter.org/" target="_blank" rel="noopener noreferrer">
                          <img src="https://www.onetcenter.org/image/link/onet-in-it.svg" className="w-20 h-auto opacity-40 hover:opacity-80 transition-opacity" alt="O*NET in-it" />
                        </a>
                        <p className="text-[8px] text-muted-foreground text-center">
                          O*NET® is a trademark of USDOL/ETA.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </DialogContent>
              </Dialog>
            </motion.div>
          )}

          {view === "detail" && selectedFamily && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              {/* Header */}
              <div className={`rounded-2xl p-6 md:p-8 mb-8 ${selectedFamily.surfaceClass}`}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{selectedFamily.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-heading font-bold text-foreground">
                        {t(`career_families.${selectedFamily.id}.name`)}
                      </h1>
                      <span className={selectedFamily.badgeClass}>{selectedFamily.code}</span>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-2xl">
                      {t(`career_families.${selectedFamily.id}.description`)}
                    </p>
                  </div>
                </div>

                {/* Related subjects */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground mr-1 self-center">
                    <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                    {t("explorer.related_subjects")}:
                  </span>
                  {(t(`career_families.${selectedFamily.id}.subjects`, { returnObjects: true }) as string[]).map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>

              {/* Professions */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    {t("explorer.example_professions")}
                  </h2>
                  {compareItems.length >= 2 && (
                    <Button size="sm" onClick={() => setView("compare")}>
                      <Scale className="w-4 h-4" />
                      {t("explorer.compare")} ({compareItems.length})
                    </Button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(t(`career_families.${selectedFamily.id}.professions`, { returnObjects: true }) as Record<string, any>).map(([key, prof]) => (
                    <div key={key} className="card-warm p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-heading font-semibold text-foreground">{prof.title}</h3>
                        <button
                          onClick={() => toggleCompare(prof)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                            isInCompare(prof.title)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                          }`}
                        >
                          {isInCompare(prof.title) ? t("explorer.added") : t("explorer.add_compare")}
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{prof.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Briefcase className="w-3 h-3" /> {prof.salary}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="w-3 h-3" /> {prof.growth} {t("explorer.growth")}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <GraduationCap className="w-3 h-3" /> {prof.education}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pathways */}
              <div>
                <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-muted-foreground" />
                  {t("explorer.pathways")}
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {Object.entries(t(`career_families.${selectedFamily.id}.pathways`, { returnObjects: true }) as Record<string, any>).map(([key, pw]) => {
                    // Try to find the original pathway type by key if possible, but let's just use the key or a default
                    const originalPw = selectedFamily.pathways.find(p => p.name.toLowerCase().includes(key.replace('_', ' '))) || selectedFamily.pathways[0];
                    const type = originalPw.type;
                    
                    const typeColors: Record<string, string> = {
                      university: "badge-sky",
                      vocational: "badge-amber",
                      apprenticeship: "badge-sage",
                      "self-directed": "badge-rose",
                    };
                    return (
                      <div key={key} className="card-warm p-5">
                        <span className={`${typeColors[type]} mb-3 inline-block`}>
                          {t(`common.pathway_types.${type}`, type.replace("-", " "))}
                        </span>
                        <h3 className="font-heading font-semibold text-foreground mb-1">{pw.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{pw.description}</p>
                        <span className="text-xs font-medium text-foreground">⏱ {pw.duration}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {view === "compare" && (
            <motion.div
              key="compare"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-heading font-bold text-foreground">
                  {t("explorer.compare_title")}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setCompareItems([]); setView(selectedFamily ? "detail" : "grid"); }}
                >
                  <X className="w-4 h-4" /> {t("explorer.clear")}
                </Button>
              </div>
              <PathwayComparison items={compareItems} onRemove={(title) => {
                setCompareItems((p) => p.filter((i) => i.title !== title));
                if (compareItems.length <= 2) {
                  setView(selectedFamily ? "detail" : "grid");
                }
              }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating compare bar */}
        {view !== "compare" && compareItems.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border shadow-lg rounded-2xl px-5 py-3 flex items-center gap-4"
          >
            <span className="text-sm font-medium text-foreground">
              {compareItems.length} {t("explorer.selected")}
            </span>
            <div className="flex gap-2">
              {compareItems.map((p) => (
                <span key={p.title} className="badge-sky text-xs">{p.title}</span>
              ))}
            </div>
            <div className="flex gap-2">
              {compareItems.length >= 2 && (
                <Button size="sm" onClick={() => setView("compare")}>
                  <Scale className="w-4 h-4" /> {t("explorer.compare")}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setCompareItems([])}>
                {t("explorer.clear")}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
