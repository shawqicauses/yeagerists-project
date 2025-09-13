// REVIEWED

"use client";

import { useState } from "react";

import { RoleOption, rolesOptions } from "./role-option";

export const SignInForm = function SignInForm() {
  const [roleSelected, setRoleSelected] = useState<string>(rolesOptions[0].id);

  return (
    <form className="space-y-6">
      <fieldset>
        <legend className="text-sm/6 font-semibold text-foreground">
          Select your role
        </legend>
        <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          {rolesOptions.map((roleOption) => (
            <RoleOption
              key={roleOption.id}
              roleOption={roleOption}
              roleSelect={setRoleSelected}
              roleSelected={roleSelected}
            />
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
  );
};
