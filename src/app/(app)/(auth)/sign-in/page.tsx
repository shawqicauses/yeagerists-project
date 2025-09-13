// REVIEWED - 01

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
                    id={signInOption.id}
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

          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-foreground">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="focus:outline-tertiary-2 block w-full rounded-md bg-background px-3 py-1.5 text-base text-foreground outline outline-1 -outline-offset-1 outline-input placeholder:text-muted-foreground focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-foreground">
                Password
              </label>
              <div className="text-sm">
                <a
                  href="/password/reset"
                  className="text-tertiary-2 font-semibold hover:text-foreground">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="focus:outline-tertiary-2 block w-full rounded-md bg-background px-3 py-1.5 text-base text-foreground outline outline-1 -outline-offset-1 outline-input placeholder:text-muted-foreground focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="bg-tertiary-2 focus-visible:outline-tertiary-2 flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-background shadow-sm hover:bg-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
