"use client";

// REVIEWED

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, FileTextIcon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { issueCertificate } from "@/actions/certificates";
import { getUsers } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks/use-user";
import { CertificateSigned } from "@/lib/blockchain/CertificateService";
import { cn } from "@/lib/utils";
import { User } from "@/payload-types";

const signerFormSchema = z.object({
  file: z
    .instanceof(File, { message: "Please select a PDF file" })
    .refine((file) => file.type === "application/pdf", {
      message: "Only PDF files are allowed",
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File size must be less than 10 MB",
    }),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  recipientName: z
    .string()
    .min(1, "Recipient name is required")
    .max(100, "Recipient name must be less than 100 characters"),
  recipientId: z
    .string()
    .min(1, "Please select a recipient")
    .refine(
      (value) => value !== "loading" && value !== "no-users",
      "Please select a valid recipient",
    ),
  dateExpiry: z.date().optional(),
});

type SignerFormData = z.infer<typeof signerFormSchema>;

interface SignerFormProps {
  onSuccess?: (
    _certificate: Pick<
      CertificateSigned,
      "certificateId" | "metadata" | "blockchainHash" | "blockIndex"
    >,
  ) => void;
}

export const SignerForm = function SignerForm({ onSuccess }: SignerFormProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [users, setUsers] = useState<Array<User>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const { data: userCurrent } = useUser();

  const form = useForm<SignerFormData>({
    resolver: zodResolver(signerFormSchema),
    defaultValues: {
      title: "",
      description: "",
      recipientName: "",
      recipientId: "",
    },
  });

  // Load users when dialog opens
  const usersLoad = async () => {
    try {
      setIsLoadingUsers(true);

      const result = await getUsers();

      if (result.data) setUsers(result.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error loading users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const doDialogOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (open) usersLoad();
  };

  const onSubmit = async (data: SignerFormData) => {
    if (!userCurrent) {
      toast.error("User not authenticated");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await issueCertificate({
        file: data.file,
        issuerId: userCurrent.id,
        userAccreditId: parseInt(data.recipientId, 10),
        title: data.title,
        description: data.description || "",
        issuerName: userCurrent.name || "Unknown Issuer",
        recipientName: data.recipientName,
        dateExpiry: data.dateExpiry ? data.dateExpiry.toISOString() : undefined,
      });

      if (result.success && result.certificate) {
        toast.success("Certificate issued successfully!");

        form.reset();

        setIsOpen(false);

        onSuccess?.(result.certificate);

        router.refresh();
      } else toast.error(result.error || "Failed to issue certificate");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Certificate issuance error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={doDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="tertiary-2" type="button" className="w-full sm:w-auto">
          <UploadIcon className="mr-2 size-5" />
          Upload & Sign PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileTextIcon className="size-5" />
            Sign PDF Certificate
          </DialogTitle>
          <DialogDescription>
            Upload a PDF document and create a digitally signed certificate for
            a recipient.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* File Upload */}
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>PDF Document</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center gap-5 sm:flex-row">
                      <Input
                        {...field}
                        className="flex-1 shrink-0 cursor-pointer file:h-full"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onChange(file);
                        }}
                      />

                      {value && (
                        <div className="flex max-w-60 flex-1 items-center gap-2 text-sm text-muted-foreground">
                          <FileTextIcon className="size-5 shrink-0 stroke-[1.5]" />
                          <span className="truncate">{value.name}</span>
                          <span className="w-full text-xs">
                            ({(value.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Select a PDF file to sign. Maximum file size is 10MB.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Certificate Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Certificate of Completion"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A descriptive title for the certificate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Additional details about the certificate..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide additional context or details about the certificate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recipient Selection */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Shawqi Hatem" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient ID</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingUsers && (
                          <SelectItem value="loading" disabled>
                            Loading users...
                          </SelectItem>
                        )}

                        {!isLoadingUsers && users.length === 0 && (
                          <SelectItem value="no-users" disabled>
                            No users available
                          </SelectItem>
                        )}

                        {!isLoadingUsers &&
                          users.length > 0 &&
                          users.map((recipient) => (
                            <SelectItem
                              key={recipient.id}
                              value={recipient.id.toString()}>
                              {recipient.name} ({recipient.email})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Expiry Date */}
            <FormField
              control={form.control}
              name="dateExpiry"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-2 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}>
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto size-5 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Set an optional expiry date for the certificate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-5">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Fragment>
                    <div className="mr-2 size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing...
                  </Fragment>
                ) : (
                  <Fragment>
                    <FileTextIcon className="mr-2 size-5" />
                    Sign Certificate
                  </Fragment>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
