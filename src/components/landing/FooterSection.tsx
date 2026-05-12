import { Compass } from "lucide-react";
import { useTranslation } from "react-i18next";

const FooterSection = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-foreground py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg text-background">{t("common.pathfinder")}</span>
          </div>
          <p className="text-sm text-background/60">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
