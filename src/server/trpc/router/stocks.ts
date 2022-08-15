import { t } from "@server/trpc/utils";
import { z } from "zod";

export const stockRouter = t.router({
  getStockData: t.procedure
    .input(z.object({ ticker: z.string() }))
    .query(({ input }) => {
      return {
        currencySymbol: "$",
        dailyHigh: 100,
        dailyPercentChange: 0.1,
        currentPrice: 69.69,
      };
    }),
});
