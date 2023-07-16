import "./GraphLayout.css";
import Graph from "../../components/Graph/Graph";
import { Outlet, useParams } from "react-router-dom";
import SingleCard from "../../components/SingleCard/SingleCard";
import Search from "../../components/Search/Search";
import Cards from "../../components/Cards/Cards";
import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { getCommonPublications } from "../../algorithms/getCommonPublications";

const GraphLayout = () => {
  const [searchedName, setSearchedName] = useState("");
  const [sortOption, setSortOption] = useState("hindex");
  const [showSortOptions, setShowSortOptions] = useState(false);

  const { id } = useParams();
  const { data, isPending, error } = useFetch(
    `${localStorage.getItem("graphUrl")}/get_graph/${id}`,
  );

  const collabs = data ? data.nodes.slice(1) : null;
  if (collabs) {
    for (let collab of collabs) {
      collab.common_publications = getCommonPublications(
        data.edges,
        collab.scholar_id,
        data.nodes[0].scholar_id,
      );
    }
  }
  const [nodes, setNodes] = useState(null);

  // Create nodes array to send Sigma JS
  useEffect(() => {
    if (data && data.nodes && data.nodes.length > 0 && collabs) {
      const node = [
        {
          id: data.nodes[0].scholar_id,
          isClusterNode: true,
          label: data.nodes[0].name,
          rel_size: 180.0,
          size: 180,
          color: "#FFFFFF",
          citedby: data.nodes[0].citedby,
          hindex: data.nodes[0].hindex,
        },
      ];
      setNodes([
        ...node,
        ...collabs.map((collab) => {
          return {
            id: collab.scholar_id,
            label: collab.name,
            rank: Math.random(),
            degrees: Math.random() * 360,
            color: "#FFFFFF",
            citedby: collab.citedby,
            hindex: collab.hindex,
          };
        }),
      ]);
    }
  }, [data]);

  return (
    <>
      <Outlet />
      {error && <h3 className="loading-text">User Not Found</h3>}
      {isPending && (
        <h3 className="loading-text">We Are Creating The Graph...</h3>
      )}
      {!error && !isPending && data && (
        <div className="graph__section">
          <div className="graph__body">
            {nodes && data.edges ? (
              <Graph
                convertedData={{ nodes, edges: data.edges }}
                key={JSON.stringify({ nodes: nodes, edges: data.edges })}
              />
            ) : (
              <h3 className="loading-text">Loading...</h3>
            )}
            {data.nodes[0] && (
              <SingleCard person={data.nodes[0]} forGraphSection={true} />
            )}
          </div>
          {collabs && (
            <>
              <Search
                searchedName={searchedName}
                setSearchedName={setSearchedName}
                sortOption={sortOption}
                setSortOption={setSortOption}
                showSortOptions={showSortOptions}
                setShowSortOptions={setShowSortOptions}
              />
              <Cards
                collabs={collabs}
                searchedName={searchedName}
                sortOption={sortOption}
                showSortOptions={showSortOptions}
                forGraphSection={true}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};

export default GraphLayout;
