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

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 10;
      const usableWidthMm = pdf.internal.pageSize.getWidth() - margin * 2;
      const usableHeightMm = pdf.internal.pageSize.getHeight() - margin * 2;

      // Slice the tall capture into page-height chunks so each PDF page only
      // embeds ITS slice as a compressed JPEG — instead of re-embedding the full
      // high-res PNG on every page (which produced ~85MB files).
      const pxPerMm = canvas.width / usableWidthMm;
      const pageHeightPx = Math.floor(usableHeightMm * pxPerMm);

      let renderedPx = 0;
      let pageIndex = 0;
      while (renderedPx < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx);

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;
        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
        }

        const imgData = pageCanvas.toDataURL("image/jpeg", 0.85);
        const sliceHeightMm = sliceHeightPx / pxPerMm;

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", margin, margin, usableWidthMm, sliceHeightMm);

        renderedPx += sliceHeightPx;
        pageIndex++;
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
