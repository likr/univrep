import { useEffect, useState } from "react";
import dataUrl from "./data.json?url";
import Chart from "./components/Chart";

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
    <div>
      <Chart data={data} />
    </div>
  );
}
