import { useState, useEffect } from "react";

const useFetch = (url) => {
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPending(true);
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error in fetching!");
        const json = await res.json();
        setData(json);
        setIsPending(false);
      } catch (err) {
        setError(err);
        console.log(err);
        setIsPending(false);
      }
    };
    fetchData();
  }, [url]);
  return { data, isPending, error };
};

export default useFetch;
