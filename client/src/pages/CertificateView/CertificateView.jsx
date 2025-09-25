import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Download } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
// import { Document, Page } from "react-pdf";

export default function CertificateView() {
  const [searchParams] = useSearchParams();
  const certificateNumber = searchParams.get("certNo");

  const [certificateURL, setCertificateURL] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!certificateNumber) {
      setError("Certificate number not provided");
      setLoading(false);
      return;
    }

    const fetchCertificate = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/certificates/get-by-number`,
          { certificate_number: certificateNumber }
        );

        if (response.data.success && response.data.certificate) {
          setCertificateURL(response.data.certificate.certificate_url);
        } else {
          setError("Certificate not found");
        }
      } catch (err) {
        console.error("Error fetching certificate:", err);
        setError("Failed to fetch certificate");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateNumber]);

  const handleDownload = () => {
    if (!certificateURL) return;
    const a = document.createElement("a");
    a.href = certificateURL;
    a.target = "_blank";
    a.download = `${certificateNumber}.pdf`;
    a.click();
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error)
    return (
      <p className="text-center mt-10 text-red-500">Certificate Not Found</p>
    );

  return (
    <div className="p-6 space-y-4">
      <div className="w-full h-[88vh] border rounded-lg overflow-hidden">
        {/* <iframe
          src={certificateURL}
          title="Certificate Preview"
          className="w-full h-full"
        /> */}
        <iframe
          src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
            certificateURL
          )}`}
          title="Certificate Preview"
          className="w-full h-full"
        />
        {/* <Document file={certificateURL}>
          <Page pageNumber={1} />
        </Document> */}
      </div>

      {/* Download Button */}
      <Button onClick={handleDownload} className="mt-2">
        <Download className="h-4 w-4 mr-2" />
        Download Certificate ({certificateNumber})
      </Button>
    </div>
  );
}
