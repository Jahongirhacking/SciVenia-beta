import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import style from "./Account.module.css";
import PropTypes from "prop-types";

function Account({ isMyProfile = false }) {
  const param = useParams();
  let url = `${localStorage.getItem("baseUrl")}/`;
  if (isMyProfile) url += localStorage.getItem("userId");
  else if (localStorage.getItem("aboutUserId")) {
    url += localStorage.getItem("aboutUserId");
  } else url += param.id;

  const { data: account, isPending, error } = useFetch(url);
  return (
    <>
      {isPending && <h3 className="loading-text">Loading...</h3>}
      {!error && account && (
        <div className={style.account}>
          <div
            className={style["profile-img"]}
            style={{ backgroundImage: `url(${account.image})` }}
          ></div>
          <ul className={style.info}>
            <li className={style.fullname}>
              {account.firstname} {account.lastname}
            </li>
            <li className="from">From: {account.from}</li>
            <li className="cluster">Cluster: {account.cluster}</li>
            <li className={style.tags}>
              Tags:{" "}
              {account.tags.map((elem, index) => (
                <span key={index}>#{elem}</span>
              ))}
            </li>
          </ul>
          <div className={style.data}>
            <p>
              {account.info}. {account.data}
            </p>
            <div className={style["chart"]}>
              <div className={style["chart__overlay"]}>In Process...</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Account.propTypes = {
  url: PropTypes.string,
  isMyProfile: PropTypes.bool,
};

export default Account;
