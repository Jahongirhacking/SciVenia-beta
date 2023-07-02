import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
const baseUrl = `${localStorage.getItem("baseUrl")}`;

function collabFinder(userId) {
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const getAllCollabs = async () => {
      try {
        setIsPending(true);
        const resUser = await fetch(`${baseUrl}/${userId}`);
        const user = await resUser.json();
        setData([]);
        for (let collabId of user.collabs) {
          const resCollab = await fetch(`${baseUrl}/${collabId}`);
          const collab = await resCollab.json();
          setData((prev) => [...prev, collab]);
        }
        setIsPending(false);
      } catch (err) {
        setError(err);
        setIsPending(false);
      }
    };
    getAllCollabs(userId);
  }, [userId]);
  return { data, isPending, error };
}

export default collabFinder;
