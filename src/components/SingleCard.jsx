import style from "./SingleCard.module.css";
import { Link } from "react-router-dom";

function SingleCard({ person, forGraphSection = false }) {
  return (
    <div className={`${style.card} card`}>
      <div
        className={style["card__img-cover"]}
        style={{ backgroundImage: `url(${person.image})` }}
      ></div>
      <ul>
        <li className={style.fullname}>
          {person.firstname} {person.lastname}
        </li>
        <li>
          <span>From:</span>
          <span className={style.from}>{person.from}</span>
        </li>
        <li>
          <span>Cluster:</span>
          <span className={style.from}>{person.cluster}</span>
        </li>
      </ul>
      <div className={style["buttons-list"]}>
        <Link
          onClick={() => localStorage.setItem("aboutUserId", person.id)}
          to={forGraphSection ? `./about` : `../collaborations/${person.id}`}
          className="btn"
        >
          About
        </Link>
        <Link to={`../graph/${person.id}`} className="btn">
          Show Graph
        </Link>
      </div>
    </div>
  );
}

export default SingleCard;
