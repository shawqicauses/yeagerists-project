"use client";

// REVIEWED

import { AlertCircle, CheckCircle, Download, XCircle } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";

import { verifyCertificate } from "@/actions/certificates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VerificationViewerProps {
  certificateId: string | null;
  verificationResult?: {
    isValid: boolean;
    certificate?: Record<string, unknown>;
    verificationDetails?: Record<string, unknown>;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationViewer = function VerificationViewer({
  certificateId,
  verificationResult,
  isOpen,
  onClose,
}: VerificationViewerProps) {
  const [verification, setVerification] = useState<{
    isValid: boolean;
    certificate?: Record<string, unknown>;
    verificationDetails?: Record<string, unknown>;
  } | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (verificationResult) {
      setVerification(verificationResult);
    } else if (certificateId) {
      setVerification(null); // Clear verification when switching to certificate ID mode
    }
  }, [verificationResult, certificateId]);

  const doVerify = async function doVerify() {
    if (!certificateId) return;

    setIsVerifying(true);

    try {
      const result = await verifyCertificate(parseInt(certificateId, 10));
      if (result.success && result.verification) {
        // Convert VerifyCertificate to our expected format
        const verificationConverted = {
          isValid: result.verification.isValid,
          certificate: result.verification.certificate as unknown as Record<
            string,
            unknown
          >,
          verificationDetails: result.verification
            .verificationDetails as unknown as Record<string, unknown>,
        };

        setVerification(verificationConverted);

        toast.success("Certificate verification completed");
      } else {
        toast.error(result.error || "Verification failed");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Verification error:", error);
      toast.error("An unexpected error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  const doDownload = async () => {
    if (!verification?.certificate?.certificateId) return;

    try {
      // Import download action dynamically to avoid circular dependencies
      const { certificateDownload } = await import("@/actions/certificates");
      const result = await certificateDownload(
        String(verification.certificate.certificateId),
      );

      if (result.success && result.bufferFile) {
        // Convert base64 string back to binary data
        const binaryString = atob(result.bufferFile);

        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i += 1) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Create a blob and download file
        const blob = new Blob([bytes], { type: "application/pdf" });

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = `certificate-${verification.certificate.certificateId}.pdf`;

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);

        toast.success("Certificate downloaded successfully");
      } else {
        toast.error(result.error || "Failed to download certificate");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Download error:", error);
      toast.error("An un-expected error occurred during download");
    }
  };

  const getStatusIcon = (isValid: boolean) => {
    if (isValid) {
      return <CheckCircle className="size-5 text-tertiary-2" />;
    }
    return <XCircle className="size-5 text-secondary" />;
  };

  const getStatusBadge = (isValid: boolean) => {
    if (isValid) {
      return (
        <Badge
          variant="outline"
          className="border-tertiary-2 bg-tertiary-2/5 text-tertiary-2">
          Valid
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-secondary bg-secondary/5 text-secondary">
        In-valid
      </Badge>
    );
  };

  const getDialogDescription = () => {
    if (verificationResult) {
      return "Verification results from uploaded file";
    }

    if (certificateId) {
      return "Verify certificate by ID";
    }

    return "No certificate selected";
  };

  // Type guards for safe access
  const getVerificationDetails = () => {
    if (!verification?.verificationDetails) return null;

    const details = verification.verificationDetails;

    return {
      fileExists: Boolean(details.fileExists),
      blockchainVerified: Boolean(details.blockchainVerified),
      signatureValid: Boolean(details.signatureValid),
      contentValid: Boolean(details.contentValid),
      primaryHashValid: Boolean(details.primaryHashValid),
    };
  };

  const getCertificateData = () => {
    if (!verification?.certificate) return null;

    const { certificate } = verification;

    return {
      certificateId: String(certificate.certificateId || ""),
      filePath: String(certificate.filePath || ""),
      metadata: (certificate.metadata as Record<string, unknown>) || {},
      blockchainHash: String(certificate.blockchainHash || ""),
      blockIndex: Number(certificate.blockIndex || 0),
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {verification ? (
              getStatusIcon(verification.isValid)
            ) : (
              <AlertCircle className="size-5" />
            )}
            Certificate Verification
          </DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!verification && certificateId && (
            <div className="py-8 text-center">
              <p className="mb-5 text-muted-foreground">
                Click button below to verify certificate ID: {certificateId}
              </p>
              <Button onClick={() => doVerify()} disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify Certificate"}
              </Button>
            </div>
          )}

          {!verification && !certificateId && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                No certificate selected for verification
              </p>
            </div>
          )}

          {verification && (
            <Fragment>
              {/* Overall Status */}
              <div className="flex items-center justify-between rounded-lg border border-input p-5">
                <div className="flex items-center gap-5">
                  {getStatusIcon(verification.isValid)}
                  <div>
                    <h3 className="font-semibold">Overall Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {verification.isValid
                        ? "Certificate is valid and authentic"
                        : "Certificate verification failed"}
                    </p>
                  </div>
                </div>
                {getStatusBadge(verification.isValid)}
              </div>

              {/* Verification Details */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold">Verification Details</h3>
                {(() => {
                  const details = getVerificationDetails();

                  if (!details) return null;

                  return (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="flex items-center justify-between rounded-lg border p-5">
                        <span className="text-sm font-medium">File Exists</span>

                        {getStatusIcon(details.fileExists)}
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-5">
                        <span className="text-sm font-medium">
                          Content Hash Valid
                        </span>

                        {getStatusIcon(details.contentValid)}
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-5">
                        <span className="text-sm font-medium">
                          Primary Hash Valid
                        </span>

                        {getStatusIcon(details.primaryHashValid)}
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-5">
                        <span className="text-sm font-medium">
                          Signature Valid
                        </span>

                        {getStatusIcon(details.signatureValid)}
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-5">
                        <span className="text-sm font-medium">
                          Blockchain Verified
                        </span>

                        {getStatusIcon(details.blockchainVerified)}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Certificate Details */}
              {(() => {
                const certificationData = getCertificateData();
                if (!certificationData) return null;

                return (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Certificate Details
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => doDownload()}
                        className="flex items-center gap-2">
                        <Download className="size-5" />
                        Download
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label
                          htmlFor="certificate-id"
                          className="text-sm font-medium text-foreground">
                          Certificate ID
                        </label>
                        <p
                          id="certificate-id"
                          className="rounded bg-muted p-2 font-mono text-sm">
                          {certificationData.certificateId}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label
                          htmlFor="certificate-title"
                          className="text-sm font-medium text-foreground">
                          Title
                        </label>
                        <p id="certificate-title" className="text-sm">
                          {String(certificationData.metadata?.title || "")}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label
                          htmlFor="certificate-issuer"
                          className="text-sm font-medium text-foreground">
                          Issuer
                        </label>
                        <p id="certificate-issuer" className="text-sm">
                          {String(certificationData.metadata?.issuerName || "")}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label
                          htmlFor="certificate-recipient"
                          className="text-sm font-medium text-foreground">
                          Recipient
                        </label>
                        <p id="certificate-recipient" className="text-sm">
                          {String(
                            certificationData.metadata?.recipientName || "",
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label
                          htmlFor="certificate-date-issued"
                          className="text-sm font-medium text-foreground">
                          Date Issued
                        </label>
                        <p id="certificate-date-issued" className="text-sm">
                          {certificationData.metadata?.dateIssued
                            ? new Date(
                                String(certificationData.metadata.dateIssued),
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label
                          htmlFor="certificate-date-expiry"
                          className="text-sm font-medium text-foreground">
                          Expiry Date
                        </label>
                        <p id="certificate-date-expiry" className="text-sm">
                          {certificationData.metadata?.dateExpiry
                            ? new Date(
                                String(certificationData.metadata.dateExpiry),
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label
                          htmlFor="certificate-blockchain-hash"
                          className="text-sm font-medium text-foreground">
                          Blockchain Hash
                        </label>
                        <p
                          id="certificate-blockchain-hash"
                          className="break-all rounded bg-muted p-2 font-mono text-sm">
                          {certificationData.blockchainHash}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label
                          htmlFor="certificate-block-index"
                          className="text-sm font-medium text-foreground">
                          Block Index
                        </label>
                        <p id="certificate-block-index" className="text-sm">
                          {certificationData.blockIndex}
                        </p>
                      </div>
                    </div>
                    {certificationData.metadata?.description ? (
                      <div className="flex flex-col gap-2">
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label
                          htmlFor="certificate-description"
                          className="text-sm font-medium text-foreground">
                          Description
                        </label>
                        <p
                          id="certificate-description"
                          className="text-sm leading-relaxed text-muted-foreground">
                          {String(certificationData.metadata.description || "")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })()}

              {/* No Certificate Found */}
              {!verification.certificate && (
                <div className="py-8 text-center">
                  <XCircle className="mx-auto mb-4 size-12 stroke-[1.5] text-secondary" />
                  <h3 className="mb-2 text-lg font-semibold">
                    Certificate Not Found
                  </h3>
                  <p className="text-muted-foreground">
                    The certificate file could not be found in system.
                  </p>
                </div>
              )}
            </Fragment>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
