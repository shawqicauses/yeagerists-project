// REVIEWED - 03

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { signUpSchema, SignUpSchema } from "@/lib/schemas/auth";

import { RoleOption, rolesOptions } from "./role-option";

export const SignUpForm = function SignUpForm() {
  const { signUp } = useAuth();

  const [roleSelected, setRoleSelected] = useState<string>(rolesOptions[0].id);

  const form = useForm<SignUpSchema>({
    mode: "onBlur",
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: roleSelected,
      name: "Sample Name No. 02",
      email: "sample_2@example.com",
      password: "SamplePassword@1234",
    },
  });

  // Sync form role field with roleSelected state
  useEffect(() => {
    form.setValue("role", roleSelected);
  }, [roleSelected, form]);

  const handleSubmit = function handleSubmit(data: SignUpSchema) {
    toast.loading("Signing up...", {
      id: "sign-up",
    });

    signUp.mutate({
      role: data.role,
      name: data.name,
      email: data.email.trim().toLowerCase(),
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

        {roleSelected === "issuer-user" ? (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <FormLabel className="block text-sm/6 font-medium text-foreground">
                  Issuer Name
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm/6 font-medium text-foreground">
                  Accredited User Name
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm/6 font-medium text-foreground">
                Email address
              </FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel className="block text-sm/6 font-medium text-foreground">
                Password
              </FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button variant="tertiary-2" disabled={signUp.isPending}>
            {signUp.isPending ? "Signing up..." : "Sign up"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
