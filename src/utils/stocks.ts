import { type SessionContextValue } from "next-auth/react";

import { trpc } from "@utils/trpc";

const LOCAL_STORAGE_KEY = "stocks";

export const getStocks = (status: SessionContextValue["status"]) => {
  if (status === "loading" || status === "unauthenticated") {
    return localStorage.getItem(LOCAL_STORAGE_KEY) ?? "";
  }
  return "";
};

export const updateStocks = (
  status: SessionContextValue["status"],
  stocksSet: Set<string>,
) => {
  if (status === "loading" || status === "unauthenticated") {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(Array.from(stocksSet.values())),
    );
  }

  return;
};
