import style from "./Search.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

function Search({
  searchedName,
  setSearchedName,
  sortOption,
  setSortOption,
  showSortOptions,
  setShowSortOptions,
}) {
  const handleRadioButtonClick = (e) => {
    setSortOption(e.target.value);
  };
  return (
    <form className={style.search} onSubmit={(e) => e.preventDefault()}>
      <div className={style["form__input"]}>
        <input
          className={`${style["search__input"]} search__input-name`}
          type="search"
          name="search"
          placeholder="Search Collaborator…"
          autoComplete="off"
          value={searchedName}
          onChange={(e) => setSearchedName(e.target.value)}
        />
        <button
          className={`${style["form__btn"]} btn`}
          onClick={() => setShowSortOptions((prev) => !prev)}
        >
          <FontAwesomeIcon icon={faChevronDown} />
        </button>
      </div>
      {showSortOptions && (
        <div className={style["form__sort"]}>
          <p>Sort By:</p>
          <label>
            <span>H-Index</span>
            <input
              type="radio"
              name="sort-input"
              id="hIndex-value"
              value="hindex"
              checked={"hindex" === sortOption}
              onChange={handleRadioButtonClick}
            />
          </label>
          <label>
            <span>Cited By</span>
            <input
              type="radio"
              name="sort-input"
              id="citedBy-value"
              value="citedby"
              checked={"citedby" === sortOption}
              onChange={handleRadioButtonClick}
            />
          </label>
          <label>
            <span>Common Publications</span>
            <input
              type="radio"
              name="sort-input"
              id="common_publications-value"
              value="common_publications"
              checked={"common_publications" === sortOption}
              onChange={handleRadioButtonClick}
            />
          </label>
        </div>
      )}
    </form>
  );
}

export default Search;
