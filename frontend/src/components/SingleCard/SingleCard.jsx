import style from "./SingleCard.module.css";
import { Link } from "react-router-dom";

function capitalizeWords(sentence) {
  return sentence
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function SingleCard({ person, forGraphSection = false }) {
  // Array should be defined and length should be greater than 0
  const interest =
    person.interests && person.interests.length > 0
      ? capitalizeWords(person.interests[0])
      : "none";
  return (
    <div className={`${style.card} card`}>
      <div
        className={style["card__img-cover"]}
        style={{
          backgroundImage: `url(${
            person.url_picture ||
            "https://img.freepik.com/free-icon/user_318-159711.jpg"
          })`,
        }}
      ></div>
      <ul>
        <li className={style.fullname}>{person.name}</li>
        <li className={`${style.row_value} h_index`}>
          H-Index:
          <span>{person.hindex}</span>
        </li>
        <li className={`${style.row_value} cited_by`}>
          Cited By:
          <span>{person.citedby}</span>
        </li>
        <li className={`${style.row_value} common_publics`}>
          Publics.:
          <span>{person.common_publications}</span>
        </li>
        <li>
          Cluster:
          <span className={style.from}>
            {interest?.length > 25
              ? interest.substring(0, 23) + "..."
              : interest}
          </span>
        </li>
      </ul>
      <div className={style["buttons-list"]}>
        <Link
          onClick={() =>
            localStorage.setItem("aboutUserName", `${person.scholar_id}`)
          }
          to={
            forGraphSection
              ? `./about`
              : `../collaborations/${person.scholar_id}`
          }
          className="btn"
        >
          About
        </Link>
        <Link to={`../graph/${person.scholar_id}`} className="btn">
          Show Graph
        </Link>
      </div>
    </div>
  );
}

export default SingleCard;
