import { motion } from "framer-motion";
import { Compass, Users, BarChart3, MessageCircle, BookOpen, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Compass,
      title: t("features.items.discovery.title"),
      description: t("features.items.discovery.description"),
      surface: "surface-sage",
    },
    {
      icon: BookOpen,
      title: t("features.items.exploration.title"),
      description: t("features.items.exploration.description"),
      surface: "surface-amber",
    },
    {
      icon: Target,
      title: t("features.items.planning.title"),
      description: t("features.items.planning.description"),
      surface: "surface-sky",
    },
    {
      icon: Users,
      title: t("features.items.family.title"),
      description: t("features.items.family.description"),
      surface: "surface-rose",
    },
    {
      icon: BarChart3,
      title: t("features.items.counselor.title"),
      description: t("features.items.counselor.description"),
      surface: "surface-sage",
    },
    {
      icon: MessageCircle,
      title: t("features.items.coach.title"),
      description: t("features.items.coach.description"),
      surface: "surface-amber",
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
            {t("features.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("features.subtitle")}
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-interactive p-6"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.surface} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
