import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const Home: NextPage = () => {
  const [input, setInput] = useState("");
  const [stocks, setStocks] = useState<string[]>([]);
  const [response, setResponse] = useState("");
  const [animationStocks] = useAutoAnimate<HTMLDivElement>();
  const [animationResponse] = useAutoAnimate<HTMLParagraphElement>();

  // Loads the stocks in local storage on mount
  useEffect(() => {
    const savedStocks = localStorage.getItem("stocks");
    savedStocks !== null && setStocks(JSON.parse(savedStocks));
    console.log("Loaded from local storage: ", savedStocks);
  }, []);

  // Updates the local storage
  useEffect(() => {
    // Check if we are doing the initial load
    if (response !== "") {
      localStorage.setItem("stocks", JSON.stringify(stocks));
      console.log("Updating local storage: ", stocks);
    }
  }, [stocks, response]);

  const handleAddStockEvent = () => {
    if (!input || input.trim().length == 0) {
      return;
    }

    if (stocks.includes(input)) {
      setResponse(`❌ ${input.toUpperCase()} is already being tracked!`);
    } else {
      setStocks([...stocks, input.toUpperCase()]);
      setResponse(`✅ Added ${input.toUpperCase()}`);
    }
    setInput("");
  };

  const handleDeleteCard = (stock: string, index: number) => {
    setResponse(`🗑 Removed ${stock}`);
    setStocks([
      ...stocks.slice(0, index),
      ...stocks.slice(index + 1, stocks.length),
    ]);
  };

  return (
    <div>
      <Head>
        <title>Stocks Dashboard</title>
        <meta name="description" content="A Simple Stocks Dashboard." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <NavBar />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddStockEvent();
          }}
          className="flex flex-row justify-center mt-4"
        >
          <input
            type="text"
            placeholder="e.g., AAPL"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-100 py-2 px-4 mr-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          ></input>
          <button className="shadow bg-purple-600 hover:bg-purple-500 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded">
            Add Stock
          </button>
        </form>
        <p ref={animationResponse} className="text-center mt-4 font-mono">
          {response}
        </p>
        <div ref={animationStocks} className="flex flex-wrap justify-center">
          {stocks.map((stock, index) => (
            <StockCard
              key={index}
              ticker={stock}
              deleteCard={() => handleDeleteCard(stock, index)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

const StockCard: React.FC<{ ticker: string; deleteCard: () => void }> = (
  props
) => {
  const stockData = getStockData(props.ticker);

  return (
    <div className="w-96 min-h-36 bg-neutral-50 drop-shadow rounded-xl p-3 m-4">
      <div className="flex flex-row justify-center relative">
        <h2 className="text-center text-lg font-bold">{props.ticker}</h2>
        <button onClick={props.deleteCard} className="absolute top-0 right-0">
          ❌
        </button>
      </div>
      <div className="flex flex-wrap justify-center items-center relative mt-2">
        <div className="text-center ml-1 mr-2">
          <p className="font-bold">Daily High</p>
          <p className="font-bold text-2xl">
            {stockData.currencySymbol}
            {stockData.dailyHigh}
          </p>
        </div>
        <div className="text-center ml-2 mr-2">
          <p className="font-bold">Current Price</p>
          <p className="font-bold text-4xl">
            {stockData.currencySymbol}
            {stockData.currentPrice}
          </p>
        </div>
        <div className="text-center ml-2 mr-1">
          <p className="font-bold">% Change</p>
          <p className="font-bold text-xl">
            {stockData.dailyPercentChange * 100}%
          </p>
        </div>
      </div>
    </div>
  );
};

const getStockData = (ticker: string) => {
  return {
    currencySymbol: "$",
    dailyHigh: 100,
    dailyPercentChange: 0.1,
    currentPrice: 69.69,
  };
};

const NavBar: React.FC<{}> = () => {
  return (
    <nav className="bg-neutral-50 border-gray-200 px-2 sm:px-4 py-2.5 drop-shadow-sm">
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <span className="self-center text-xl font-semibold whitespace-nowrap">
          Stock Dashboard
        </span>
        {/* <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="flex flex-col p-4 mt-4 bg-gray-50 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-white">
              <li>
                <a
                  href=""
                  className="block py-2 pr-4 pl-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0"
                >
                  Sign-in With Google
                </a>
              </li>
            </ul>
          </div> */}
      </div>
    </nav>
  );
};

export default Home;
