import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import Cards from "../../components/Cards/Cards";
// import style from "./CollabsLayout.module.css";
import { Outlet } from "react-router-dom";
import Search from "../../components/Search/Search";
import { getCommonPublications } from "../../algorithms/getCommonPublications";

function CollabsLayout() {
  const [searchedName, setSearchedName] = useState("");
  const [sortOption, setSortOption] = useState("hindex");
  const [showSortOptions, setShowSortOptions] = useState(false);
  // Main Data
  const { data, error, isPending } = useFetch(
    `${localStorage.getItem("graphUrl")}/get_graph/${localStorage.getItem(
      "userID",
    )}`,
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
  return (
    <>
      <Outlet />
      {isPending && (
        <h3 className="loading-text">We are searching your collaborators...</h3>
      )}
      {error && <h3 className="loading-text">No Collaboration Found</h3>}
      {!error && collabs && (
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
          />
        </>
      )}
    </>
  );
}

export default CollabsLayout;
