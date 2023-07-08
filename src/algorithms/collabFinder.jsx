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
        const resUsers = await fetch(`${baseUrl}`);
        const users = await resUsers.json();
        setData([]);
        for (let collabId of users[userId].collabs) {
          const collab = users[collabId];
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
