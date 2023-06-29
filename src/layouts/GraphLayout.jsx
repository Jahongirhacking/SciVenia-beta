import data from "../data.json";
import "./GraphLayout.css";
import Graph from "../components/Graph";
import jsonConverter from "../hooks/jsonConverter.jsx";
import { v4 as uuid4 } from "uuid";
const convertedData = jsonConverter(data);

const GraphLayout = () => {
  convertedData.edges.forEach((edge) => {
    edge.id = uuid4();
  });

  return (
    <div className="graph__section">
      <div className="graph__body">
        <Graph convertedData={convertedData} />
      </div>
    </div>
  );
};

export default GraphLayout;
