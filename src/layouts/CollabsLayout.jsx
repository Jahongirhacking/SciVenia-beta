import { useState } from "react";
import useFetch from "../hooks/useFetch";
import Cards from "../components/Cards";
import style from "./CollabsLayout.module.css";
import { Outlet } from "react-router-dom";
import Search from "../components/Search";
import collabFinder from "../algorithms/collabFinder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

function CollabsLayout() {
  const {
    data: collabs,
    isPending,
    error,
  } = collabFinder(`${localStorage.getItem("userId")}`);
  const [searchedName, setSearchedName] = useState("");
  return (
    <>
      <Outlet />
      {isPending && (
        <h3 className={style["loading-text"]}>
          <FontAwesomeIcon icon={faSpinner} spin />
        </h3>
      )}
      {!error && collabs && (
        <>
          <Search
            searchedName={searchedName}
            setSearchedName={setSearchedName}
          />
          <Cards collabs={collabs} searchedName={searchedName} />
        </>
      )}
    </>
  );
}

export default CollabsLayout;
