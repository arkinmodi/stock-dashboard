import { t } from "@server/trpc/utils";
import { TRPCError } from "@trpc/server";
import getSymbolFromCurrency from "currency-symbol-map";
import yahooFinance from "yahoo-finance2";
import { z } from "zod";

export const stockRouter = t.router({
  getStockData: t.procedure
    .input(z.object({ ticker: z.string() }))
    .query(async ({ input }) => {
      const stockData = await yahooFinance.quote(input.ticker);

      if (!stockData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Failed to find stock data for " + input.ticker + ".",
        });
      }

      if (
        stockData.currency === undefined ||
        stockData.regularMarketDayHigh === undefined ||
        stockData.regularMarketChangePercent === undefined ||
        stockData.regularMarketPrice === undefined
      ) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load stock data for " + input.ticker + ".",
        });
      }

      const currencySymbol = getSymbolFromCurrency(stockData.currency) ?? "";
      const dailyHigh = stockData.regularMarketDayHigh;
      const dailyPercentChange = stockData.regularMarketChangePercent;
      const currentPrice = stockData.regularMarketPrice;

      return {
        currencySymbol,
        dailyHigh,
        dailyPercentChange,
        currentPrice,
      };
    }),
});
