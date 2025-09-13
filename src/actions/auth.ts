"use server";

// REVIEWED

import { headers } from "next/headers";

import { actionSafeExecute } from "@/lib/network";
import { payload } from "@/lib/payload";

export const getAuthentication = async function getAuthentication() {
  const response = await actionSafeExecute(
    payload.auth({ headers: await headers() }),
    "Server Error.",
  );

  if (!response.data || response.error) return null;

  return response.data;
};
