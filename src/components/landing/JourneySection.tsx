import { motion } from "framer-motion";
import { Search, Compass, Map, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";

const JourneySection = () => {
  const { t } = useTranslation();

  const stages = [
    {
      icon: Search,
      grade: t("journey.stages.discovery.grade"),
      title: t("journey.stages.discovery.title"),
      description: t("journey.stages.discovery.description"),
      color: "bg-sage-100 text-sage-700",
    },
    {
      icon: Compass,
      grade: t("journey.stages.exploration.grade"),
      title: t("journey.stages.exploration.title"),
      description: t("journey.stages.exploration.description"),
      color: "bg-amber-100 text-amber-600",
    },
    {
      icon: Map,
      grade: t("journey.stages.planning.grade"),
      title: t("journey.stages.planning.title"),
      description: t("journey.stages.planning.description"),
      color: "bg-sky-100 text-sky-500",
    },
    {
      icon: Rocket,
      grade: t("journey.stages.launch.grade"),
      title: t("journey.stages.launch.title"),
      description: t("journey.stages.launch.description"),
      color: "bg-rose-100 text-rose-500",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            {t("journey.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("journey.subtitle")}
          </p>
        </motion.div>
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
          <div className="space-y-8">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-6 items-start"
              >
                <div className={`w-16 h-16 rounded-2xl ${stage.color} flex items-center justify-center flex-shrink-0 relative z-10`}>
                  <stage.icon className="w-7 h-7" />
                </div>
                <div className="card-warm p-6 flex-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{stage.grade}</div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2">{stage.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{stage.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
