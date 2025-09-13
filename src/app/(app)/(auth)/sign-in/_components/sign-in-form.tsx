// REVIEWED - 01

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { SignInSchema, signInSchema } from "@/lib/schemas/auth";

import { RoleOption, rolesOptions } from "./role-option";

export const SignInForm = function SignInForm() {
  const { signIn } = useAuth();

  const [roleSelected, setRoleSelected] = useState<string>(rolesOptions[0].id);

  const form = useForm<SignInSchema>({
    mode: "onBlur",
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "sample@example.com",
      password: "SamplePassword@1234",
    },
  });

  const handleSubmit = function handleSubmit(data: SignInSchema) {
    toast.loading("Signing in...", {
      id: "sign-in",
    });

    signIn.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <div className="text-sm">
                  <a
                    href="/password/reset"
                    className="font-semibold text-tertiary-2 hover:text-foreground">
                    Forgot password?
                  </a>
                </div>
              </div>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button variant="tertiary-2" disabled={signIn.isPending}>
            {signIn.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
