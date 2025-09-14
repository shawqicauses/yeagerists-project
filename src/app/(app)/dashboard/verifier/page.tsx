"use client";

// REVIEWED

import { useState } from "react";

import { VerifierUpload } from "./_components/upload-verifier";
import { VerificationViewer } from "./_components/verification-viewer";

interface VerificationResult {
  isValid: boolean;
  certificate?: Record<string, unknown>;
  verificationDetails?: Record<string, unknown>;
}

export default function VerifierPage() {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);

  const doVerificationComplete = (result: VerificationResult) => {
    setVerificationResult(result);
    setIsViewerOpen(true);
  };

  const doViewerClose = () => {
    setIsViewerOpen(false);
    setVerificationResult(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-7">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Certificate <span className="text-primary">Verifier</span>.
        </h1>
        <p className="mt-2 text-muted-foreground md:text-lg">
          View and verify your digitally signed certificates with blockchain
          verification
        </p>
      </div>

      <div className="space-y-8">
        <div className="flex justify-center">
          <VerifierUpload onVerificationComplete={doVerificationComplete} />
        </div>
      </div>

      {/* Verification Viewer Modal */}
      <VerificationViewer
        certificateId={null}
        verificationResult={verificationResult}
        isOpen={isViewerOpen}
        onClose={doViewerClose}
      />
    </div>
  );
}
