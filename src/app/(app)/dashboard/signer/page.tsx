// REVIEWED

import { PlusIcon, ShieldCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SignerPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-5 text-center lg:px-7">
      <ShieldCheckIcon className="size-20 stroke-[1.5] text-tertiary-2" />
      <h3 className="mt-2 text-base font-semibold text-foreground md:text-lg lg:text-xl">
        Sign a <span className="text-tertiary-2">PDF</span> document.
      </h3>
      <p className="mt-1 text-sm text-muted-foreground md:text-base">
        Get started by uploading a PDF document and signing it.
      </p>
      <div className="mt-6">
        <Button variant="tertiary-2" type="button">
          <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 !size-5" />
          Upload a PDF
        </Button>
      </div>
    </div>
  );
}
