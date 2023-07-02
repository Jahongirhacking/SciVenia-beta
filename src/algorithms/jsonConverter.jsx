import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";

// This function is not used
// function onlyUnique(value, index, array) {
//   return array.indexOf(value) === index;
// }

const jsonConverter = (userId) => {
  const [user, setUser] = useState(null);
  const [collabs, setCollabs] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [nodes, setNodes] = useState(null);
  const [edges, setEdges] = useState(null);
  const baseUrl = localStorage.getItem("baseUrl");

  useEffect(() => {
    // BFS Algorithm to create Graph
    const BFS = async (id) => {
      try {
        setIsPending(true);
        setCollabs([]);
        setNodes([]);
        setEdges([]);
        let lvl = 0;
        const visitedNode = new Set();
        const visitedEdge = new Set();
        const queue = [{ id, lvl }];
        while (queue.length !== 0) {
          const { id: userId, lvl: level } = queue[0];
          queue.shift();
          // If node is already visited -> ignore
          if (visitedNode.has(userId)) continue;
          visitedNode.add(userId);
          const response = await fetch(`${baseUrl}/${userId}`);
          const person = await response.json();
          const nodeObj = {
            id: person.id,
            label: `${person.firstname} ${person.lastname}`,
          };
          if (level === 0) {
            // If it's current user
            setUser(person);
            // create node
            nodeObj.isClusterNode = true;
            nodeObj.rel_size = 180.0;
            nodeObj.size = 180;
            nodeObj.color = "#FFFFFF";
          } else {
            // If user's nearest collaborator
            if (level === 1) setCollabs((prev) => [...prev, person]);
            // WARNING: rank is random
            nodeObj.rank = Math.random();
            nodeObj.degrees = Math.random() * 360;
          }
          // Update Nodes
          setNodes((prev) => [...prev, nodeObj]);

          // EDGE PART
          for (let collabId of person.collabs) {
            let edgeName =
              collabId < person.id
                ? `${collabId}-${person.id}`
                : `${person.id}-${collabId}`;
            if (visitedEdge.has(edgeName)) continue;
            visitedEdge.add(edgeName);
            // Next BFS search
            queue.push({ id: collabId, lvl: level + 1 });
            // Add edges to the list
            setEdges((prev) => [
              ...prev,
              { id: edgeName, source: person.id, target: collabId },
            ]);
          }
        }
        setIsPending(false);
      } catch (err) {
        setError(err);
      }
    };
    BFS(userId);
  }, [userId]);

  // Exceptional Cases to not show the Graph (WAITING)
  if (!user || !collabs || error) {
    return null;
  }

  // RESULT (nodes, edges)
  return {
    user,
    collabs,
    error,
    isPending,
    nodes,
    edges,
  };
};

export default jsonConverter;
