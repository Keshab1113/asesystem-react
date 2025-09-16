import React from "react";
import { Button } from "../../components/ui/button";
import { Download } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function CertificateView() {
  const [searchParams] = useSearchParams();
  const certificateURL = searchParams.get("url");
  const certificateNumber = searchParams.get("certNo");

  if (!certificateURL) {
    return <p className="text-center mt-10">No certificate found</p>;
  }

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = certificateURL;
    a.target = "_blank";
    a.download = `${certificateNumber}.pdf`;
    a.click();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="w-full h-[88vh] border rounded-lg overflow-hidden">
        <iframe
          src={certificateURL}
          title="Certificate Preview"
          className="w-full h-full"
        />
      </div>

      {/* Download Button */}
      <Button onClick={handleDownload} className="mt-2">
        <Download className="h-4 w-4 mr-2" />
        Download Certificate ({certificateNumber})
      </Button>
    </div>
  );
}
