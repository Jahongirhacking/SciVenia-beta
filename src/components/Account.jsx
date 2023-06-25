import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import style from "./Account.module.css";
import PropTypes from "prop-types";

function Account({ url, isMyProfile }) {
  const param = useParams();
  if (!isMyProfile) url += `?id=${param.id}`;
  const { data, isPending, error } = useFetch(url);
  const account = data ? data[0] : null;
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
