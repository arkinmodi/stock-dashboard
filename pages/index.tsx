import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const [input, setInput] = useState("");
  const [stocks, setStocks] = useState<string[]>([]);
  const [response, setResponse] = useState("");

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
        <h1 className="text-2xl font-bold">Stock Dashboard</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (!input || input.trim().length == 0) {
              return;
            }

            if (stocks.includes(input)) {
              setResponse(
                `❌ ${input.toUpperCase()} is already being tracked!`
              );
            } else {
              setStocks([...stocks, input.toUpperCase()]);
              setResponse(`✅ Added ${input.toUpperCase()}`);
            }
            setInput("");
          }}
        >
          <input
            type="text"
            placeholder="e.g., AAPL"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
          ></input>
          <button>Add Stock</button>
        </form>
        <p>{response}</p>
        <div>
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
    <div>
      <h1>{props.ticker}</h1>
      <div>
        {stockData.currencySymbol}
        {stockData.currentPrice}
      </div>
      <div>
        {stockData.currencySymbol}
        {stockData.opening}
      </div>
      <div>{stockData.dailyPercentChange * 100}%</div>
      <button onClick={props.deleteCard}>❌</button>
    </div>
  );
};

const getStockData = (ticker: string) => {
  return {
    currencySymbol: "$",
    opening: 100,
    dailyPercentChange: 0.1,
    currentPrice: 69.69,
  };
};

export default Home;
