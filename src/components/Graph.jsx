import {
  Sigma,
  RandomizeNodePositions,
  NOverlap,
  RelativeSize,
} from "react-sigma";
import { v4 as uuid4 } from "uuid";
import ForceLink from "react-sigma/lib/ForceLink.js";
import { useNavigate } from "react-router-dom";

function Graph({ nodes = [], edges = [] }) {
  const navigate = useNavigate();
  const handleNodeClick = (e) => {
    navigate(`../graph/${e.data.node.id}`, { replace: true });
  };
  return (
    <div className="graph">
      <Sigma
        key={JSON.stringify({ nodes, edges })}
        onClickNode={handleNodeClick}
        graph={{
          nodes,
          edges,
        }}
        settings={{
          animationsTime: 500,
          defaultLabelSize: 15,
          drawLabels: true,
          labelSize: "fixed",
          labelThreshold: 5,
        }}
        style={{
          height: "inherit",
          width: "inherit",
        }}
      >
        <RandomizeNodePositions>
          <ForceLink
            background
            easing="cubicInOut"
            iterationsPerRender={1}
            linLogMode
            timeout={50}
            worker
            outboundAttractionDistribution={true}
          />

          <NOverlap
            duration={2000}
            easing="quadraticInOut"
            gridSize={20}
            maxIterations={100}
            nodeMargin={10}
            scaleNodes={4}
            speed={10}
          />
          <RelativeSize initialSize={10} />
        </RandomizeNodePositions>
      </Sigma>
    </div>
  );
}

export default Graph;
