"use client";

// REVIEWED

import { zodResolver } from "@hookform/resolvers/zod";
import { FileTextIcon, UploadIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  verifyCertificateByFile,
  verifyCertificateByUUID,
} from "@/actions/certificates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const VerifierUploadSchema = z.object({
  certificateId: z.string().optional(),
});

type DataVerifierUpload = z.infer<typeof VerifierUploadSchema>;

interface PropsVerifierUpload {
  onVerificationComplete?: (_result: {
    isValid: boolean;
    certificate?: Record<string, unknown>;
    verificationDetails?: Record<string, unknown>;
  }) => void;
}

export const VerifierUpload = function VerifierUpload({
  onVerificationComplete,
}: PropsVerifierUpload) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<"id" | "file">(
    "id",
  );

  const [fileSelected, setFileSelected] = useState<File | null>(null);

  const form = useForm<DataVerifierUpload>({
    resolver: zodResolver(VerifierUploadSchema),
    defaultValues: {
      certificateId: "",
    },
  });

  const onSubmit = async (data: DataVerifierUpload) => {
    setIsVerifying(true);
    try {
      let result;

      if (verificationMethod === "id") {
        // Validate certificate ID for ID method
        if (!data.certificateId || data.certificateId.trim() === "") {
          toast.error("Certificate ID is required");
          setIsVerifying(false);
          return;
        }

        // Validate UUID format
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(data.certificateId)) {
          toast.error("In-valid certificate ID format (must be a valid UUID)");
          setIsVerifying(false);
          return;
        }

        result = await verifyCertificateByUUID(data.certificateId);
      } else if (verificationMethod === "file") {
        // Validate file for file method
        if (!fileSelected) {
          toast.error("Please select a PDF file to upload");
          setIsVerifying(false);
          return;
        }

        result = await verifyCertificateByFile(fileSelected);
      } else {
        result = {
          success: false,
          error:
            "Please select a verification method and provide required input.",
        };
      }

      if (result.success && result.verification) {
        toast.success("Certificate verification completed!");

        onVerificationComplete?.(
          result.verification as {
            isValid: boolean;
            certificate?: Record<string, unknown>;
            verificationDetails?: Record<string, unknown>;
          },
        );

        form.reset();

        setFileSelected(null);
        setIsOpen(false);
      } else {
        toast.error(result.error || "Certificate verification failed");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Certificate verification error:", error);
      toast.error("An un-expected error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  const doFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10 MB limit
        toast.error("File size must be less than 10 MB");
        return;
      }

      setFileSelected(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UploadIcon className="size-5" />
          Verify Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadIcon className="size-5" />
            Verify Certificate
          </DialogTitle>
          <DialogDescription>
            Choose a verification method to verify certificate authenticity and
            blockchain integrity.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Verification Method Selection */}
            <div className="space-y-2">
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label
                htmlFor="verification-method"
                className="text-sm font-medium">
                Verification Method
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={verificationMethod === "id" ? "default" : "outline"}
                  size="sm"
                  disabled={isVerifying}
                  onClick={() => setVerificationMethod("id")}>
                  Certificate ID
                </Button>
                <Button
                  type="button"
                  variant={
                    verificationMethod === "file" ? "default" : "outline"
                  }
                  size="sm"
                  disabled={isVerifying}
                  onClick={() => setVerificationMethod("file")}>
                  Upload PDF
                </Button>
              </div>
            </div>

            {/* Certificate ID Input */}
            {verificationMethod === "id" && (
              <FormField
                control={form.control}
                name="certificateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate ID *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 550e8400-f290a-40b4-c26-446655440000"
                        {...field}
                        disabled={isVerifying}
                        required
                      />
                    </FormControl>
                    <FormDescription>
                      Enter unique certificate ID (UUID format) you want to
                      verify.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* PDF File Upload */}
            {verificationMethod === "file" && (
              <div className="space-y-2">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="pdf-upload" className="text-sm font-medium">
                  PDF Certificate File *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={doFileChange}
                    disabled={isVerifying}
                    className="hidden"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50">
                    <FileTextIcon className="size-5 stroke-[1.5]" />
                    {fileSelected ? fileSelected.name : "Choose PDF file..."}
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload PDF certificate file to verify its authenticity.
                  {fileSelected && (
                    <span className="mt-1 block text-tertiary-2">
                      ✓ File selected: {fileSelected.name} (
                      {(fileSelected.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isVerifying}
                onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify Certificate"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
