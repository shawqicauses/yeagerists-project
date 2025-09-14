"use client";

// REVIEWED - 02

import { ShieldCheckIcon } from "lucide-react";
import { useState } from "react";

import { CertificateSigned } from "@/lib/blockchain";

import { CertificateViewer } from "./_components/certificate-viewer";
import { CertificatesIssued } from "./_components/issued-certificates";
import { SignerForm } from "./_components/signer-form";

export default function SignerPage() {
  const [certificateIdSelected, setCertificateIdSelected] = useState<
    string | null
  >(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const doCertificateSuccess = (
    certificate: Pick<
      CertificateSigned,
      "certificateId" | "metadata" | "blockchainHash" | "blockIndex"
    >,
  ) => {
    // Optionally show success message or redirect
    console.log("Certificate issued successfully:", certificate);
  };

  const doCertificateView = (certificateId: string) => {
    setCertificateIdSelected(certificateId);
    setIsViewerOpen(true);
  };

  const doViewerClose = () => {
    setIsViewerOpen(false);
    setCertificateIdSelected(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-7">
      {/* Header */}
      <div className="mb-8 text-center">
        <ShieldCheckIcon className="mx-auto size-16 stroke-[1.5] text-tertiary-2" />
        <h1 className="mt-4 text-2xl font-bold text-foreground md:text-3xl">
          Digital Certificate <span className="text-tertiary-2">Signer</span>.
        </h1>
        <p className="mt-2 text-muted-foreground md:text-lg">
          Create and manage digitally signed PDF certificates with blockchain
          verification
        </p>
      </div>

      <div className="space-y-12">
        <div className="flex justify-center">
          <SignerForm onSuccess={doCertificateSuccess} />
        </div>

        <CertificatesIssued onCertificateView={doCertificateView} />
      </div>

      <CertificateViewer
        certificateId={certificateIdSelected}
        isOpen={isViewerOpen}
        onClose={doViewerClose}
      />
    </div>
  );
}
