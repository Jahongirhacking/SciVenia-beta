import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import Cards from "../../components/Cards/Cards";
import style from "./Collaborations.module.css";

function Collaborations() {
  const myCollabUrl = "http://localhost:3000/collaborations";
  const { data: collabs, isPending, error } = useFetch(myCollabUrl);
  const [searchedName, setSearchedName] = useState("");
  return (
    <>
      {isPending && <h3 className="loading-text">Loading...</h3>}
      {!error && collabs && (
        <>
          <form className={style.search}>
            <input
              className={`${style["search__input"]} search__input-name`}
              type="search"
              name="search"
              placeholder="Search by name…"
              autoComplete="off"
              value={searchedName}
              onChange={(e) => setSearchedName(e.target.value)}
            />
          </form>
          <Cards collabs={collabs} searchedName={searchedName} />
        </>
      )}
    </>
  );
}

export default Collaborations;
