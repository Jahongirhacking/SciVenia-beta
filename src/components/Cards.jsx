import PropTypes from "prop-types";
import style from "./Cards.module.css";
import { Link } from "react-router-dom";

function Cards({ collabs, searchedName }) {
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
        collabs.filter(compareCollab).map((collab) => (
          <div key={collab.id} className={style.card}>
            <div
              className={style["card__img-cover"]}
              style={{ backgroundImage: `url(${collab.image})` }}
            ></div>
            <ul>
              <li className={style.fullname}>
                {collab.firstname} {collab.lastname}
              </li>
              <li>
                <span>From:</span>
                <span className={style.from}>{collab.from}</span>
              </li>
              <li>
                <span>Cluster:</span>
                <span className={style.from}>{collab.cluster}</span>
              </li>
            </ul>
            <div className={style["buttons-list"]}>
              <Link to={`./${collab.id}`} className="btn">
                About
              </Link>
              <Link to={`../graph/${collab.id}`} className="btn">
                Show Graph
              </Link>
            </div>
          </div>
        ))}
    </div>
  );
}

Cards.propTypes = {
  collabs: PropTypes.array,
  searchedName: PropTypes.string,
};

export default Cards;
