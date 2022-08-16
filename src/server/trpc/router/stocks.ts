import { t } from "@server/trpc/utils";
import getSymbolFromCurrency from "currency-symbol-map";
import yahooFinance from "yahoo-finance2";
import { z } from "zod";

export const stockRouter = t.router({
  getStockData: t.procedure
    .input(z.object({ ticker: z.string() }))
    .query(async ({ input }) => {
      // await new Promise((r) => setTimeout(r, 3000));

      // todo throw 404 if not found
      const stockData = await yahooFinance.quote(input.ticker);

      // todo return error if any of this data is missing
      const currencySymbol =
        getSymbolFromCurrency(stockData.currency ?? "") ?? "";
      const dailyHigh = stockData.regularMarketDayHigh ?? 0;
      const dailyPercentChange = stockData.regularMarketChangePercent ?? 0;
      const currentPrice = stockData.regularMarketPrice ?? 0;

      return {
        currencySymbol,
        dailyHigh,
        dailyPercentChange,
        currentPrice,
      };
    }),
});
