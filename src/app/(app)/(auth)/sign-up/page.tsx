// REVIEWED

import { SignUpForm } from "../sign-in/_components/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-foreground">
          Sign up to your account<span className="text-tertiary-2">.</span>
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <SignUpForm />

        <p className="mt-10 text-center text-sm/6 text-muted-foreground">
          Do you already have an account?{" "}
          <a
            href="/sign-in"
            className="text-tertiary-2 font-semibold hover:text-foreground">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
