"use client";

// REVIEWED - 02

import { FileTextIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  certificateDownload,
  getIssuerCertificates,
} from "@/actions/certificates";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { CertificateSigned } from "@/lib/blockchain/CertificateService";

import { CertificateCard } from "./certificate-card";

interface PropsCertificatesIssued {
  onCertificateView?: (_certificateId: string) => void;
}

export const CertificatesIssued = function CertificatesIssued({
  onCertificateView,
}: PropsCertificatesIssued) {
  const [certificates, setCertificates] = useState<
    Pick<
      CertificateSigned,
      "certificateId" | "metadata" | "blockchainHash" | "blockIndex"
    >[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const { data: user } = useUser();

  const certificatesLoad = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const result = await getIssuerCertificates(user.id);

      if (result.success && result.certificates)
        setCertificates(result.certificates);
      else toast.error(result.error || "Failed to load certificates");
    } catch (error) {
      console.error("Error loading certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const doDownload = async (certificateId: string) => {
    try {
      setIsDownloading(certificateId);
      const result = await certificateDownload(certificateId);

      if (result.success && result.bufferFile) {
        // Convert base64 string back to binary data
        const binaryString = atob(result.bufferFile);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i += 1)
          bytes[i] = binaryString.charCodeAt(i);

        // Create a blob and download file
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `certificate-${certificateId}.pdf`;

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);

        toast.success("Certificate downloaded successfully");
      } else toast.error(result.error || "Failed to download certificate");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download certificate");
    } finally {
      setIsDownloading(null);
    }
  };

  const doView = (certificateId: string) => {
    onCertificateView?.(certificateId);
  };

  useEffect(() => {
    certificatesLoad();
  }, [certificatesLoad]);

  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardHeader className="p-5">
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="size-5" />
            Issued Certificates
          </CardTitle>
          <CardDescription>Your digitally signed certificates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-5 pt-0">
          {Array.from({ length: 3 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none">
      <CardHeader className="p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="size-5" />
              Issued Certificates
            </CardTitle>
            <CardDescription>
              {certificates.length} certificate
              {certificates.length !== 1 ? "s" : ""} issued
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={certificatesLoad}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {certificates.length === 0 ? (
          <div className="py-8 text-center">
            <FileTextIcon className="mx-auto size-12 stroke-[1.5] text-foreground" />
            <h3 className="mt-2 text-base font-semibold text-foreground lg:text-lg">
              No certificates issued
            </h3>
            <p className="mt-1 text-sm text-muted-foreground lg:text-base">
              Get started by signing your first PDF document.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((certificate) => (
              <CertificateCard
                key={certificate.certificateId}
                certificate={certificate}
                isLoading={isDownloading === certificate.certificateId}
                onView={doView}
                onDownload={doDownload}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
