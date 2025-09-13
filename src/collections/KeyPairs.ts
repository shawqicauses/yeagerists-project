// REVIEWED

import { CollectionConfig } from "payload";

export const KeyPairs: CollectionConfig = {
  slug: "key-pairs",
  admin: {
    useAsTitle: "issuerId",
    defaultColumns: ["issuerId", "createdAt"],
  },
  access: {
    read: () => true, // Public read for verification
    create: () => true, // Allow creation
    update: () => true, // Allow updates
    delete: () => true, // Allow deletion
  },
  fields: [
    {
      name: "issuer",
      label: "Issuer",
      type: "relationship",
      relationTo: "users",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "algorithm",
      label: "Algorithm",
      type: "text",
      defaultValue: "RSA",
    },
    {
      name: "publicKey",
      label: "Public Key",
      type: "textarea",
      required: true,
    },
    {
      name: "privateKey",
      label: "Private Key",
      type: "textarea",
      required: true,
    },
    {
      name: "keySize",
      label: "Key Size",
      type: "number",
      defaultValue: 2048,
    },

    {
      name: "isActive",
      label: "Is Active",
      type: "checkbox",
      defaultValue: true,
    },
  ],
  timestamps: true,
};
