// REVIEWED

import { CheckCircleIcon } from "@heroicons/react/20/solid";

const signInOptions = [
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

export default function SignInPage() {
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-foreground">
          Sign in to your account<span className="text-tertiary-2">.</span>
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <form action="#" method="POST" className="space-y-6">
          <fieldset>
            <legend className="text-sm/6 font-semibold text-foreground">
              Select your role
            </legend>
            <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              {signInOptions.map((signInOption) => (
                <label
                  key={signInOption.id}
                  htmlFor={signInOption.id}
                  aria-label={signInOption.title}
                  aria-description={signInOption.description}
                  className="has-[:checked]:outline-tertiary-2 group relative flex rounded-lg border border-input bg-background p-4 has-[:disabled]:border-input has-[:disabled]:bg-muted has-[:disabled]:opacity-25 has-[:checked]:outline has-[:focus-visible]:outline has-[:checked]:outline-2 has-[:focus-visible]:outline-[3px] has-[:checked]:-outline-offset-2 has-[:focus-visible]:-outline-offset-1">
                  <input
                    name="role"
                    type="radio"
                    defaultValue={signInOption.id}
                    defaultChecked={signInOption === signInOptions[0]}
                    className="absolute inset-0 appearance-none focus:outline focus:outline-0"
                  />
                  <div className="flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      {signInOption.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {signInOption.description}
                    </span>
                  </div>
                  <CheckCircleIcon
                    aria-hidden="true"
                    className="text-tertiary-2 invisible size-5 group-has-[:checked]:visible"
                  />
                </label>
              ))}
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
