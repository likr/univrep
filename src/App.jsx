import dataUrl from "./data.json?url";

import { useEffect, useState } from "react";
import Chart from "./components/Chart";
import Header from "./components/Header";

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const response = await fetch(dataUrl);
      const data = await response.json();
      setData(data);
    })();
  }, []);

  if (data == null) {
    return <p>loading...</p>;
  }

  return (
    <>
      <Header />
      <Chart data={data} />
    </>
  );
}
