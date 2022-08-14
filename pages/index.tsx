import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";

const Home: NextPage = () => {
  let [text, setText] = useState("");
  let [stocks, setStocks] = useState<string[]>([]);

  return (
    <div>
      <Head>
        <title>Stocks</title>
        <meta name="description" content="A Simple Stocks Dashboard." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStocks([...stocks, text]);
            setText("");
          }}
        >
          <input
            type="text"
            placeholder="e.g., APPL"
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
          ></input>
          <button>Add Stock</button>
        </form>
        <ul></ul>
        {stocks.map((stock) => (
          <li key={stock}>{stock}</li>
        ))}
      </main>
    </div>
  );
};

export default Home;
