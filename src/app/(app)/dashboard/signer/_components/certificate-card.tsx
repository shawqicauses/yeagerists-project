"use client";

// REVIEWED

import { format } from "date-fns";
import {
  CalendarIcon,
  CalendarX2Icon,
  DownloadIcon,
  EyeIcon,
  HashIcon,
  UserIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CertificateMetadata, CertificateSigned } from "@/lib/blockchain";

interface CertificateCardProps {
  certificate: Pick<
    CertificateSigned,
    "certificateId" | "blockchainHash" | "blockIndex"
  > & {
    metadata: Pick<
      CertificateMetadata,
      | "title"
      | "description"
      | "dateIssued"
      | "dateExpiry"
      | "issuerName"
      | "recipientName"
      | "certificateId"
    >;
  };
  onView?: (_certificateId: string) => void;
  onDownload?: (_certificateId: string) => void;
}

export const CertificateCard = function CertificateCard({
  certificate,
  onView,
  onDownload,
}: CertificateCardProps) {
  const { metadata, blockchainHash, blockIndex } = certificate;

  const isExpired = metadata.dateExpiry
    ? new Date(metadata.dateExpiry) < new Date()
    : false;
  const isExpiringSoon = metadata.dateExpiry
    ? new Date(metadata.dateExpiry) <
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : false;

  return (
    <Card className="w-full shadow-none">
      <CardHeader className="p-5 pb-0">
        <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
          <div className="space-y-1">
            <CardTitle className="text-lg">{metadata.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <UserIcon className="size-5" />
              Issued to {metadata.recipientName}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            {/* eslint-disable-next-line no-nested-ternary */}
            {isExpired ? (
              <Badge
                variant="outline"
                className="border-secondary bg-secondary/5 text-secondary">
                Expired
              </Badge>
            ) : isExpiringSoon ? (
              <Badge
                variant="outline"
                className="border-yellow-500 bg-yellow-50 text-yellow-500">
                Expires Soon
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-tertiary-2 bg-tertiary-2/5 text-tertiary-2">
                Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        {metadata.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {metadata.description}
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 text-sm md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-5 text-muted-foreground" />
              <span className="font-medium">Issued:</span>
              <span>
                {format(new Date(metadata.dateIssued), "MMM dd, yyyy")}
              </span>
            </div>

            {metadata.dateExpiry && (
              <div className="flex items-center gap-2">
                <CalendarX2Icon className="size-5 text-muted-foreground" />
                <span className="font-medium">Expires:</span>
                <span
                  className={
                    /* eslint-disable-next-line no-nested-ternary */
                    isExpired
                      ? "text-secondary"
                      : isExpiringSoon
                        ? "text-yellow-600"
                        : ""
                  }>
                  {format(new Date(metadata.dateExpiry), "MMM dd, yyyy")}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HashIcon className="size-5 text-muted-foreground" />
              <span className="font-medium">Block:</span>
              <span className="font-mono text-xs">{blockIndex}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Issuer:</span>
              <span>{metadata.issuerName}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HashIcon className="size-5" />
            <span className="font-medium">Blockchain Hash:</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <code className="block w-full truncate rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                  {blockchainHash}
                </code>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs break-all">{blockchainHash}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 p-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView?.(certificate.certificateId)}>
                <EyeIcon className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Certificate</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload?.(certificate.certificateId)}>
                <DownloadIcon className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download PDF</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};
