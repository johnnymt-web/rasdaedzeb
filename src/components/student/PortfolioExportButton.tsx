import { useState, useRef } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Props {
  studentName: string;
  targetElementId: string;
}

export default function PortfolioExportButton({ studentName, targetElementId }: Props) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(targetElementId);
    if (!element) {
      console.error("Target element not found:", targetElementId);
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let yPosition = 10;
      let remainingHeight = imgHeight;

      while (remainingHeight > 0) {
        pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
        remainingHeight -= pageHeight - 20;
        if (remainingHeight > 0) {
          pdf.addPage();
          yPosition = -(imgHeight - remainingHeight) + 10;
        }
      }

      const fileName = `${studentName.replace(/\s+/g, "_")}_Career_Portfolio.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export Portfolio PDF
        </>
      )}
    </Button>
  );
}
