import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import style from "./Account.module.css";
import PropTypes from "prop-types";

function Account({ isMyProfile = false }) {
  const param = useParams();
  let url = `${localStorage.getItem("baseUrl")}`;
  const { data: account, isPending, error } = useFetch(url);
  let userProfile = null;
  if (account) {
    if (isMyProfile) userProfile = account[localStorage.getItem("userId")];
    else if (localStorage.getItem("aboutUserId")) {
      userProfile = account[localStorage.getItem("aboutUserId")];
    } else userProfile = account[param.id];
  }

  return (
    <>
      {isPending && <h3 className="loading-text">Loading...</h3>}
      {!error && userProfile && (
        <div className={style.account}>
          <div
            className={style["profile-img"]}
            style={{ backgroundImage: `url(${userProfile.image})` }}
          ></div>
          <ul className={style.info}>
            <li className={style.fullname}>
              {userProfile.firstname} {userProfile.lastname}
            </li>
            <li className="from">From: {userProfile.from}</li>
            <li className="cluster">Cluster: {userProfile.cluster}</li>
            <li className={style.tags}>
              Tags:{" "}
              {userProfile.tags.map((elem, index) => (
                <span key={index}>#{elem}</span>
              ))}
            </li>
          </ul>
          <div className={style.data}>
            <p>
              {userProfile.info}. {userProfile.data}
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
