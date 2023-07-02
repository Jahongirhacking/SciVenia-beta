import PropTypes from "prop-types";
import style from "./Cards.module.css";
import SingleCard from "./SingleCard";

function Cards({ collabs, searchedName, forGraphSection = false }) {
  const compareCollab = (collab) => {
    return (
      collab.firstname.toLowerCase().indexOf(searchedName.toLowerCase()) ===
        0 ||
      collab.lastname.toLowerCase().indexOf(searchedName.toLowerCase()) === 0
    );
  };
  return (
    <div className={style.cards}>
      {collabs &&
        collabs
          .filter(compareCollab)
          .map((collab) => (
            <SingleCard
              key={collab.id}
              person={collab}
              forGraphSection={forGraphSection}
            />
          ))}
    </div>
  );
}

Cards.propTypes = {
  collabs: PropTypes.array,
  searchedName: PropTypes.string,
};

export default Cards;
