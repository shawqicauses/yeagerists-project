// REVIEWED - 01

import { User } from "@/payload-types";

// PayLoad CMS

export type ErrorPayload = {
  status: number;
  name: string;
  message: string;
};

export type ErrorPlusDataPayload = ErrorPayload & {
  data: {
    errors: {
      message: string;
      path: string;
    }[];
  };
};

export type ResponseDataAuthenticationTokenPayload = {
  user: User;
  token: string | null;
};

export type ResponseDataAuthenticationRefreshedTokenPayload = {
  user: User;
  refreshedToken: string | null;
};

// Actions/HTTPs
export type ResponseSafeExecuteError<E = string> = { data: null; error: E };

export type ResponseSafeExecute<D, E = string> =
  | { data: D; error: null }
  | ResponseSafeExecuteError<E>;

export type SafeExecuteConfig = {
  skip?: {
    http?: boolean;
    errors?: number[];
  };
};
