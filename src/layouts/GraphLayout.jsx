// import data from "../data.json";
import "./GraphLayout.css";
import Graph from "../components/Graph";
import jsonConverter from "../algorithms/jsonConverter.jsx";
import { Outlet, useParams } from "react-router-dom";
import SingleCard from "../components/SingleCard";
import Search from "../components/Search";
import Cards from "../components/Cards";
import { useEffect, useState } from "react";
const baseUrl = localStorage.getItem("baseUrl");

const GraphLayout = () => {
  const [searchedName, setSearchedName] = useState("");
  const { id: userId } = useParams();
  const data = jsonConverter(userId);
  return (
    <>
      <Outlet />
      {data && !data.error && (
        <div className="graph__section">
          <div className="graph__body">
            {data.nodes && data.edges ? (
              <Graph nodes={data.nodes} edges={data.edges} />
            ) : (
              <h3 className="loading-text">Loading...</h3>
            )}
            {data.user && (
              <SingleCard person={data.user} forGraphSection={true} />
            )}
          </div>
          {data.collabs && (
            <>
              <Search
                searchedName={searchedName}
                setSearchedName={setSearchedName}
              />
              <Cards
                collabs={data.collabs}
                searchedName={searchedName}
                forGraphSection={true}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};

export default GraphLayout;
