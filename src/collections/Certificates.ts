// REVIEWED - 01
import { CollectionConfig } from "payload";

export const Certificates: CollectionConfig = {
  slug: "certificates",
  admin: {
    useAsTitle: "certificateId",
    defaultColumns: ["certificateId", "issuer", "recipient", "createdAt"],
  },
  access: {
    read: () => true, // Public read for verification
    create: () => true, // Allow creation
    update: () => true, // Allow updates
    delete: () => true, // Allow deletion
  },
  fields: [
    {
      name: "certificateId",
      label: "Certificate ID",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "issuer",
      label: "Issuer",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    {
      name: "recipient",
      label: "Recipient",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    {
      name: "certificateHash",
      label: "Certificate Hash",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "contentHash",
      label: "Content Hash",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "keyPair",
      label: "Key Pair",
      type: "relationship",
      relationTo: "key-pairs",
      required: true,
    },
    {
      name: "signature",
      label: "Signature",
      type: "textarea",
      required: true,
    },
    {
      name: "fileName",
      label: "File Name",
      type: "text",
    },
    {
      name: "fileURL",
      label: "File URL",
      type: "text",
      required: true,
    },
    {
      name: "fileSize",
      label: "File Size",
      type: "number",
    },
    {
      name: "metadata",
      label: "Meta Data",
      type: "json",
      required: true,
    },
    {
      name: "blockchainHash",
      label: "Blockchain Hash",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "blockIndex",
      label: "Block Index",
      type: "number",
      required: true,
    },
    {
      name: "isVerified",
      label: "Is Verified",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "verificationCount",
      label: "Verification Count",
      type: "number",
      defaultValue: 0,
    },
  ],
  timestamps: true,
};
