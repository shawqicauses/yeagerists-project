// REVIEWED - 01
import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: { useAsTitle: "email" },
  auth: true,
  fields: [
    {
      name: "role",
      label: "Role",
      type: "select",
      options: ["admin", "issuer-user", "accredited-user"],
      defaultValue: "accredited-user",
      required: true,
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      unique: true,
    },
  ],
};
