import { Context } from "@server/trpc/context";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const t = initTRPC<{ ctx: Context }>()({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});
