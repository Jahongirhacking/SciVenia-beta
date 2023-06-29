import {
  Sigma,
  RandomizeNodePositions,
  NOverlap,
  RelativeSize,
} from "react-sigma";
import ForceLink from "react-sigma/lib/ForceLink.js";

function Graph({ convertedData }) {
  console.log("Test", convertedData);
  return (
    <div className="graph">
      <Sigma
        graph={convertedData}
        settings={{
          animationsTime: 1500,
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
            timeout={100}
            worker
            outboundAttractionDistribution={false}
          />

          <NOverlap
            duration={3000}
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
