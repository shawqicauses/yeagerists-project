"use server";

// REVIEWED - 01

import { actionSafeExecute } from "@/lib/network";
import { payload } from "@/lib/payload";
import { SignUpSchema } from "@/lib/schemas/auth";
import { ResponseSafeExecute } from "@/lib/types";
import { isResponseErrorHasDataPlusErrors } from "@/lib/types/guards";
import { User } from "@/payload-types";

export const getUserByEmail = async function getUserByEmail(email: string) {
  const query = { email: { equals: email } };
  const response = await payload.find({
    collection: "users",
    where: query,
    overrideAccess: false,
    req: { query },
  });

  return response;
};

export const createUser = async function createUser(
  data: SignUpSchema,
): Promise<ResponseSafeExecute<User, string>> {
  const response = await actionSafeExecute(
    payload.create({
      collection: "users",
      data: {
        ...data,
        role: data.role === "issuer-user" ? "issuer-user" : "accredited-user",
      },
    }),
    "Server Error.",
    isResponseErrorHasDataPlusErrors,
  );

  if (!response.data || response.error) {
    if (typeof response.error === "string")
      return { data: null, error: response.error };

    if (
      response.error.status === 400 &&
      response.error.data.errors[0].path === "email"
    )
      return {
        data: null,
        error: `User with email ${data.email} already exists.`,
      };

    return {
      data: null,
      error: "Server Error.",
    };
  }

  return response;
};

export const getUsers = async function getUsers(): Promise<
  ResponseSafeExecute<User[], string>
> {
  const response = await actionSafeExecute(
    payload.find({
      collection: "users",
      limit: 100,
      where: {
        role: {
          equals: "accredited-user",
        },
      },
    }),
    "Server Error.",
    isResponseErrorHasDataPlusErrors,
  );

  // Transform response to match expected type
  if (response.data) {
    return {
      data: response.data.docs,
      error: null,
    };
  }

  return {
    data: null,
    error:
      typeof response.error === "string" ? response.error : "Server Error.",
  };
};
