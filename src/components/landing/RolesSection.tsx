import { motion } from "framer-motion";
import { GraduationCap, Heart, ClipboardList, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const RolesSection = () => {
  const { t } = useTranslation();

  const roles = [
    {
      icon: GraduationCap,
      title: t("roles.items.student.title"),
      subtitle: t("roles.items.student.subtitle"),
      description: t("roles.items.student.description"),
      link: "/student",
      cta: t("roles.items.student.cta"),
      surface: "surface-sage",
      badge: "badge-sage",
    },
    {
      icon: Heart,
      title: t("roles.items.parent.title"),
      subtitle: t("roles.items.parent.subtitle"),
      description: t("roles.items.parent.description"),
      link: "/parent",
      cta: t("roles.items.parent.cta"),
      surface: "surface-amber",
      badge: "badge-amber",
    },
    {
      icon: ClipboardList,
      title: t("roles.items.counselor.title"),
      subtitle: t("roles.items.counselor.subtitle"),
      description: t("roles.items.counselor.description"),
      link: "/counselor",
      cta: t("roles.items.counselor.cta"),
      surface: "surface-sky",
      badge: "badge-sky",
    },
    {
      icon: Settings,
      title: t("roles.items.admin.title"),
      subtitle: t("roles.items.admin.subtitle"),
      description: t("roles.items.admin.description"),
      link: "/admin",
      cta: t("roles.items.admin.cta"),
      surface: "surface-rose",
      badge: "badge-rose",
    },
  ];

  return (
    <section className="py-20 lg:py-28 surface-sage">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            {t("roles.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("roles.subtitle")}
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-interactive p-8"
            >
              <div className={`w-14 h-14 rounded-xl ${role.surface} flex items-center justify-center mb-5`}>
                <role.icon className="w-7 h-7 text-foreground" />
              </div>
              <div className={`${role.badge} mb-3`}>{role.subtitle}</div>
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">{role.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{role.description}</p>
              <Link to={role.link}>
                <Button variant="outline" size="sm">{role.cta}</Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
