import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { trpc } from "@utils/trpc";

const LOCAL_STORAGE_KEY = "stocks";
const GETTING_STARTED_MESSAGE =
  "👆 Add your first stock to your dashboard!\n(Remember to follow Yahoo Finance's Ticker Symbol Format)";

const Home: NextPage = () => {
  const { status } = useSession();
  const [stocksSet, setStocksSet] = useState(new Set<string>());
  const [response, setResponse] = useState("");

  const { data, isLoading } = trpc.proxy.user.getSavedStocks.useQuery(
    undefined,
    {
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
      enabled: status === "authenticated",
    },
  );

  const { mutate } = trpc.proxy.user.updateSavedStocks.useMutation({
    retry: 3,
  });

  // Loads the stocks in on mount
  useEffect(() => {
    let savedStocks;
    if (status === "unauthenticated") {
      savedStocks = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY) ?? "[]",
      ) as string[];
    } else {
      savedStocks = data ?? [];
    }

    const savedStocksSet = new Set<string>(savedStocks);
    setStocksSet(savedStocksSet);
    if (
      savedStocksSet.size === 0 &&
      ((status === "authenticated" && !isLoading) ||
        status === "unauthenticated")
    ) {
      setResponse(GETTING_STARTED_MESSAGE);
    }
  }, [data, isLoading, status]);

  // Updates the stocks
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
    }
  }, [stocksSet, response, status, mutate]);

  return (
    <div>
      <main>
        <NavBar />
        <Dashboard
          stocksSet={stocksSet}
          updateStocks={setStocksSet}
          response={response}
          updateResponse={setResponse}
        />
      </main>
    </div>
  );
};

const Dashboard: React.FC<{
  stocksSet: Set<string>;
  updateStocks: (stocks: Set<string>) => void;
  response: string;
  updateResponse: (res: string) => void;
}> = (props) => {
  const [input, setInput] = useState("");
  const [animationStocks] = useAutoAnimate<HTMLDivElement>();
  const [animationResponse] = useAutoAnimate<HTMLParagraphElement>();

  const { stocksSet } = props;

  const handleAddStockEvent = () => {
    if (!input || input.trim().length == 0) {
      return;
    }

    const ticker = input.toUpperCase();
    if (stocksSet.has(ticker)) {
      props.updateResponse(`❌ ${ticker} is already being tracked!`);
    } else {
      props.updateStocks(stocksSet.add(ticker));
      props.updateResponse(`✅ Added ${ticker}`);
    }
    setInput("");
  };

  const handleDeleteCardEvent = (stock: string) => {
    props.updateResponse(`🗑 Removed ${stock}`);
    stocksSet.delete(stock);
    props.updateStocks(stocksSet);
  };

  const handleStockNotFoundEvent = (stock: string) => {
    props.updateResponse(`😖 Failed to find ${stock}. Removing from tracking.`);
    stocksSet.delete(stock);
    props.updateStocks(stocksSet);
  };

  return (
    <div>
      <main>
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
          {props.response}
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
    <div className="m-4 min-h-[150px] w-full rounded-xl bg-neutral-50 p-3 drop-shadow sm:w-fit">
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
        <div className="relative mt-5 flex flex-col items-center justify-center sm:flex-row">
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
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-4 sm:justify-between">
          <div className="flex flex-row items-center gap-2">
            <Image src="/logo.png" alt="" height={32} width={32} />
            <span className="self-center whitespace-nowrap text-xl font-semibold">
              Stock Dashboard
            </span>
          </div>
          <div className="w-full md:block md:w-auto">
            <ul className="flex flex-wrap justify-center rounded-lg sm:px-2 sm:py-1">
              {(status === "unauthenticated" || status === "loading") && (
                <li>
                  <button
                    onClick={() => signIn("google")}
                    className="flex flex-row items-center justify-center"
                  >
                    <Image
                      src="/google-logo.svg"
                      height={50}
                      width={50}
                      alt=""
                    />
                    <span className="pl-2 font-medium">
                      Sign in with Google
                    </span>
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
                    <span className="px-2 font-medium">
                      {session.user?.name}
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      {(status === "unauthenticated" || status === "loading") && (
        <div className="flex flex-row items-center justify-center bg-yellow-500 px-2 py-0.5 drop-shadow-sm sm:px-4">
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
