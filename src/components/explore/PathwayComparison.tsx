import { Profession } from "@/data/careerFamilies";
import { Briefcase, TrendingUp, GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface Props {
  items: Profession[];
  onRemove: (title: string) => void;
}

export default function PathwayComparison({ items, onRemove }: Props) {
  const { t } = useTranslation();

  if (items.length < 2) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>{t("explorer.compare_hint")}</p>
      </div>
    );
  }

  const rows: { label: string; icon: React.ReactNode; key: keyof Profession }[] = [
    { label: t("explorer.comparison_rows.description"), icon: null, key: "description" },
    { label: t("explorer.comparison_rows.salary"), icon: <Briefcase className="w-4 h-4" />, key: "salary" },
    { label: t("explorer.comparison_rows.growth"), icon: <TrendingUp className="w-4 h-4" />, key: "growth" },
    { label: t("explorer.comparison_rows.education"), icon: <GraduationCap className="w-4 h-4" />, key: "education" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground w-40" />
            {items.map((item) => (
              <th key={item.title} className="p-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-foreground">{item.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRemove(item.title)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-border">
              <td className="p-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  {row.icon}
                  {row.label}
                </div>
              </td>
              {items.map((item) => (
                <td key={item.title} className="p-4 text-sm text-foreground">
                  {item[row.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
