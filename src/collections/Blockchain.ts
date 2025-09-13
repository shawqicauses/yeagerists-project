// REVIEWED

import { CollectionConfig } from "payload";

export const Blockchain: CollectionConfig = {
  slug: "blockchain",
  admin: {
    useAsTitle: "chainId",
    defaultColumns: ["chainId", "length", "isValid", "mindedAt", "updatedAt"],
  },
  access: {
    read: () => true, // Public read for verification
    create: () => true, // Allow creation
    update: () => true, // Allow updates
    delete: () => false, // Never allow deletion of blockchain data
  },
  fields: [
    {
      name: "chainId",
      label: "Chain ID",
      type: "text",
      defaultValue: "main",
      required: true,
      unique: true,
    },
    {
      name: "chainData",
      label: "Chain Data",
      type: "json",
      required: true,
    },
    {
      name: "length",
      label: "Length",
      type: "number",
      defaultValue: 1,
      required: true,
    },
    {
      name: "difficulty",
      label: "Difficulty",
      type: "number",
      defaultValue: 2,
      required: true,
    },
    {
      name: "isValid",
      label: "Is Valid",
      type: "checkbox",
      defaultValue: true,
      required: true,
    },
    {
      name: "latestBlockHash",
      label: "Latest Block Hash",
      type: "text",
      required: true,
    },
    {
      name: "certificatesCount",
      label: "Certificates Count",
      type: "number",
      defaultValue: 0,
    },
    {
      name: "mindedAt",
      label: "Mined At",
      type: "date",
    },
  ],
  timestamps: true,
};
