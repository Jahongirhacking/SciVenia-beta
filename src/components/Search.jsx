import style from "./Search.module.css";

function Search({ searchedName, setSearchedName }) {
  return (
    <form className={style.search}>
      <input
        className={`${style["search__input"]} search__input-name`}
        type="search"
        name="search"
        placeholder="Search Collaborator…"
        autoComplete="off"
        value={searchedName}
        onChange={(e) => setSearchedName(e.target.value)}
      />
    </form>
  );
}

export default Search;
