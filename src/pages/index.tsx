import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { trpc } from "@utils/trpc";

const LOCAL_STORAGE_KEY = "stocks";

const Home: NextPage = () => {
  const GETTING_STARTED_MESSAGE =
    "👆 Add a stock to your dashboard!\n(Remember to follow Yahoo Finance's Ticker Symbol Format)";

  const { status } = useSession();
  const [input, setInput] = useState("");
  const [stocksSet, setStocksSet] = useState(new Set<string>());
  const [response, setResponse] = useState("");
  const [animationStocks] = useAutoAnimate<HTMLDivElement>();
  const [animationResponse] = useAutoAnimate<HTMLParagraphElement>();

  const { data } = trpc.proxy.user.getSavedStocks.useQuery(undefined, {
    refetchInterval: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { mutate } = trpc.proxy.user.updateSavedStocks.useMutation({
    retry: 3,
  });

  // Loads the stocks in local storage on mount
  useEffect(() => {
    let savedStocks;
    if (status === "loading" || status === "unauthenticated") {
      savedStocks = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY) ?? "[]",
      ) as string[];
    } else {
      savedStocks = data ?? [];
    }

    const savedStocksSet = new Set<string>(savedStocks);
    setStocksSet(savedStocksSet);
    if (savedStocksSet.size === 0) {
      setResponse(GETTING_STARTED_MESSAGE);
    }
    console.log("Loading... Auth Status = ", status);
    console.log("Loaded from storage: ", savedStocks);
  }, [data, status]);

  // Updates the local storage
  useEffect(() => {
    // Check if we are doing the initial load
    if (response !== "" && response !== GETTING_STARTED_MESSAGE) {
      if (status === "loading" || status === "unauthenticated") {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(Array.from(stocksSet.values())),
        );
      } else {
        mutate({ stocks: stocksSet });
      }

      console.log("Saving... Auth Status = ", status);
      console.log("Updating storage: ", Array.from(stocksSet.values()));
    }
  }, [stocksSet, response, status, mutate]);

  const handleAddStockEvent = () => {
    if (!input || input.trim().length == 0) {
      return;
    }

    const ticker = input.toUpperCase();
    if (stocksSet.has(ticker)) {
      setResponse(`❌ ${ticker} is already being tracked!`);
    } else {
      setStocksSet(stocksSet.add(ticker));
      setResponse(`✅ Added ${ticker}`);
    }
    setInput("");
  };

  const handleDeleteCardEvent = (stock: string) => {
    setResponse(`🗑 Removed ${stock}`);
    stocksSet.delete(stock);
    setStocksSet(stocksSet);
  };

  const handleStockNotFoundEvent = (stock: string) => {
    setResponse(`😖 Failed to find ${stock}. Removing from tracking.`);
    stocksSet.delete(stock);
    setStocksSet(stocksSet);
  };

  return (
    <div>
      <main>
        <NavBar />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddStockEvent();
          }}
          className="mt-4 flex flex-row justify-center"
        >
          <input
            type="text"
            placeholder="e.g., AAPL"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            className="w-100 mr-4 appearance-none rounded border-2 border-gray-200 bg-gray-200 py-2 px-4 leading-tight text-gray-700 focus:border-purple-500 focus:bg-white focus:outline-none"
          ></input>
          <button className="focus:shadow-outline rounded bg-purple-600 py-2 px-4 font-bold text-white shadow hover:bg-purple-500 focus:outline-none">
            Add Stock
          </button>
        </form>
        <p
          ref={animationResponse}
          className="mt-4 whitespace-pre-wrap text-center font-mono"
        >
          {response}
        </p>
        <div ref={animationStocks} className="flex flex-wrap justify-center">
          {Array.from(stocksSet.values()).map((stock) => (
            <StockCard
              key={stock}
              ticker={stock}
              handleDeleteCardEvent={() => handleDeleteCardEvent(stock)}
              handleStockNotFoundEvent={() => handleStockNotFoundEvent(stock)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

const StockCard: React.FC<{
  ticker: string;
  handleDeleteCardEvent: () => void;
  handleStockNotFoundEvent: () => void;
}> = (props) => {
  const [notFound, setNotFound] = useState(false);
  const { handleStockNotFoundEvent } = props;

  useEffect(() => {
    notFound && handleStockNotFoundEvent();
  }, [handleStockNotFoundEvent, notFound]);

  const { data, isError, error } = trpc.proxy.stocks.getStockData.useQuery(
    {
      ticker: props.ticker,
    },
    {
      refetchInterval: 600000,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      onError: (e) => e.data?.code === "NOT_FOUND" && setNotFound(true),
    },
  );

  const failedToLoadData =
    isError && error.data?.code == "INTERNAL_SERVER_ERROR";

  return (
    <div className="min-w-96 m-4 min-h-[150px] rounded-xl bg-neutral-50 p-3 drop-shadow">
      <div className="relative flex flex-row justify-center">
        <h2 className="text-center text-lg font-bold">{props.ticker}</h2>
        <button
          onClick={props.handleDeleteCardEvent}
          className="absolute top-0 right-0"
        >
          ❌
        </button>
      </div>
      {failedToLoadData && !data && (
        <div className="relative mt-5 flex w-96 flex-wrap items-center justify-center">
          <p className="text-2xl font-bold">Error Loading Data</p>
        </div>
      )}
      {!data && !failedToLoadData && (
        <div className="relative mt-5 flex w-96 flex-wrap items-center justify-center">
          <Image src="/three-dots.svg" width={55} height={55} alt="Loading" />
        </div>
      )}
      {data && !failedToLoadData && (
        <div className="relative mt-5 flex flex-wrap items-center justify-center">
          <div className="ml-1 mr-2 text-center">
            <p className="font-bold">Daily High</p>
            <p className="text-2xl font-bold">
              {data.currencySymbol}
              {data.dailyHigh.toFixed(2)}
            </p>
          </div>
          <div className="ml-2 mr-2 text-center">
            <p className="font-bold">Current Price</p>
            <p className="text-4xl font-bold">
              {data.currencySymbol}
              {data.currentPrice.toFixed(2)}
            </p>
          </div>
          <div className="ml-2 mr-1 text-center">
            <p className="font-bold">% Change</p>
            <p
              className={`text-xl font-bold ${
                data.dailyPercentChange < 0 ? "text-red-500" : "text-green-500"
              }`}
            >
              {data.dailyPercentChange < 0 ? "▼ " : "▲ "}
              {data.dailyPercentChange.toFixed(2)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const NavBar: React.FC<{}> = () => {
  const { data: session, status } = useSession();
  return (
    <>
      <nav className="border-gray-200 bg-neutral-50 px-2 py-2.5 drop-shadow-sm sm:px-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <span className="self-center whitespace-nowrap text-xl font-semibold">
            Stock Dashboard
          </span>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-2 md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:text-sm md:font-medium">
              {(status === "unauthenticated" || status === "loading") && (
                <li>
                  <button
                    onClick={() => signIn()}
                    className="flex flex-row items-center justify-center"
                  >
                    <Image
                      src="/google-logo.svg"
                      height={50}
                      width={50}
                      alt=""
                    />
                    <p className="pl-2">Sign in with Google</p>
                  </button>
                </li>
              )}
              {status === "authenticated" && session && (
                <li>
                  <button
                    onClick={() => signOut()}
                    className="flex flex-row items-center justify-center"
                  >
                    <Image
                      src={session.user?.image ?? ""}
                      height={50}
                      width={50}
                      alt=""
                      style={{ borderRadius: 50 }}
                    />
                    <p className="px-2">{session.user?.name}</p>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      {(status === "unauthenticated" || status === "loading") && (
        <div className="flex flex-row items-center justify-center bg-yellow-500 px-2 py-0.5 sm:px-4">
          <span className="text-center font-mono text-sm text-black">
            Working Locally In Guest Mode. Sign In With Google To Use Cloud
            Saves.
          </span>
        </div>
      )}
    </>
  );
};

export default Home;
