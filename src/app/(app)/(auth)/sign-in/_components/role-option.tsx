// REVIEWED

import { CheckCircleIcon } from "@heroicons/react/20/solid";

export const rolesOptions = [
  {
    id: "issuer-user",
    title: "Issuer",
    description:
      "An issuer is a user authorized to issue signed and verified certifications to accredited users.",
  },
  {
    id: "accredited-user",
    title: "Accredited User",
    description:
      "An accredited user is a user who can receive, view, and manage certifications issued by authorized issuers.",
  },
];

export const RoleOption = function RoleOption({
  roleOption,
  roleSelect,
  roleSelected,
}: {
  roleOption: (typeof rolesOptions)[number];
  // eslint-disable-next-line no-unused-vars
  roleSelect: (role: string) => void;
  roleSelected: string;
}) {
  return (
    <label
      key={roleOption.id}
      htmlFor={roleOption.id}
      aria-label={roleOption.title}
      aria-description={roleOption.description}
      className="has-[:checked]:outline-tertiary-2 group relative flex rounded-lg border border-input bg-background p-4 has-[:disabled]:border-input has-[:disabled]:bg-muted has-[:disabled]:opacity-25 has-[:checked]:outline has-[:focus-visible]:outline has-[:checked]:outline-2 has-[:focus-visible]:outline-[3px] has-[:checked]:-outline-offset-2 has-[:focus-visible]:-outline-offset-1">
      <input
        id={roleOption.id}
        name="role"
        type="radio"
        value={roleOption.id}
        checked={roleSelected === roleOption.id}
        onChange={() => roleSelect(roleOption.id)}
        className="absolute inset-0 appearance-none focus:outline focus:outline-0"
      />
      <div className="flex-1">
        <span className="block text-sm font-medium text-foreground">
          {roleOption.title}
        </span>
        <span className="mt-1 block text-sm text-muted-foreground">
          {roleOption.description}
        </span>
      </div>
      <CheckCircleIcon
        aria-hidden="true"
        className="text-tertiary-2 invisible size-5 group-has-[:checked]:visible"
      />
    </label>
  );
};
