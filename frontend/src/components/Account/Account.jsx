import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import style from "./Account.module.css";
import PropTypes from "prop-types";
import { Chart } from "chart.js/auto";
import { useEffect, useRef } from "react";

function Account({ isMyProfile }) {
  let url = null;
  if (isMyProfile) {
    // If this is user profile use localstorage info
    url = `${localStorage.getItem("graphUrl")}/get_graph/${localStorage.getItem(
      "userID",
    )}`;
  } else if (localStorage.getItem("aboutUserName")) {
    // This part shows when we click About btn in Graph Section
    url = `${localStorage.getItem("graphUrl")}/get_graph/${localStorage.getItem(
      "aboutUserName",
    )}`;
  } else {
    // This part is from My Collaborations section
    const { id } = useParams();
    url = `${localStorage.getItem("graphUrl")}/get_graph/${id}`;
  }

  const { data: obj, error, isPending } = useFetch(url);
  const data = obj && obj.nodes ? obj.nodes[0] : null;
  const account = data ? data : null;
  // const account = data ? data.me[0] : null;
  const chartRef = useRef(null);
  const chartData = {
    labels: [],
    datasets: [
      {
        label: "Citations per Year",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  function capitalizeWords(sentence) {
    return sentence
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  if (!isPending && account && account.cites_per_year) {
    chartData.labels = Object.keys(account.cites_per_year);
    chartData.datasets[0].data = Object.values(account.cites_per_year);
  }

  useEffect(() => {
    if (!isPending && data) {
      const chart = new Chart(chartRef.current.getContext("2d"), {
        type: "bar",
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      return () => {
        chart.destroy();
      };
    }
  }, [data, isPending]);

  return (
    <>
      {error && <h3 className="loading-text">No Information Found</h3>}
      {isPending && (
        <h3 className="loading-text">
          Getting Information About This Profile...
        </h3>
      )}
      {!error && !isPending && account && (
        <div className={style.account}>
          <div
            className={style["profile-img"]}
            style={{
              backgroundImage: `url(${account.url_picture})`,
            }}
          ></div>
          <ul className={style.info}>
            <li className={style.fullname}>{account.name}</li>
            <li className="affiliation">Affiliation: {account.affiliation}</li>
            <li className="email_domain">
              Email domain: {account.email_domain}
            </li>
            <li className="citedby">Cited by: {account.citedby}</li>
            <li className="hindex">
              H-index: {account.hindex} (last 5 y.: {account.hindex5y})
            </li>
            <li className="i-10_index">
              i10-index: {account.i10index} (last 5 y.: {account.i10index5y})
            </li>
          </ul>
          <div className={style.data}>
            <div className={style["interests"]}>
              <h3> Interests: </h3>
              {account.interests &&
                account.interests.map((elem, index) => (
                  <p key={index}>{capitalizeWords(elem)}</p>
                ))}
            </div>

            <div className={style["chart"]}>
              <canvas ref={chartRef}></canvas>
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
