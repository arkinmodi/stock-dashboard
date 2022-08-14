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
    console.log("Loaded from local storage?", savedStocks);
  }, []);

  // Updates the local storage
  useEffect(() => {
    if (response !== "") {
      localStorage.setItem("stocks", JSON.stringify(stocks));
      console.log("Updating local storage?", stocks);
    }
  }, [stocks, response]);

  return (
    <div>
      <Head>
        <title>Stocks</title>
        <meta name="description" content="A Simple Stocks Dashboard." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-2xl font-bold">Stock Dashboard</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
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
        <ul></ul>
        {stocks.map((stock) => (
          <li key={stock}>{stock}</li>
        ))}
      </main>
    </div>
  );
};

export default Home;
