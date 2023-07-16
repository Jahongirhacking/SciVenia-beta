import PropTypes from "prop-types";
import style from "./Cards.module.css";
import SingleCard from "../SingleCard/SingleCard";

function Cards({
  collabs,
  searchedName,
  forGraphSection = false,
  sortOption,
  showSortOptions,
}) {
  // Check all collabs and Filter
  const compareCollab = (collab) => {
    const collabName = collab.name.toLowerCase();
    const searchedNameLower = searchedName.toLowerCase();
    return collabName.indexOf(searchedNameLower) === 0;
  };

  // Sort filtered collaborators
  // by preferemces in descending order
  const sortCollab = (arr) => {
    if (showSortOptions) {
      // todo: find common publication among the edges
      arr.sort((a, b) => b[sortOption] - a[sortOption]);
    }
  };

  let filteredCollabs = [];
  if (collabs) {
    filteredCollabs = collabs.filter(compareCollab);
    sortCollab(filteredCollabs);
  }

  return (
    <>
      <div className={style.cards}>
        {/* Collaborator Cards */}
        {collabs &&
          filteredCollabs.map((person, index) => {
            return (
              <SingleCard
                key={index}
                person={person}
                forGraphSection={forGraphSection}
              />
            );
          })}
      </div>
    </>
  );
}

Cards.propTypes = {
  collabs: PropTypes.array,
  searchedName: PropTypes.string,
};

export default Cards;
