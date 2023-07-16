import React, { useEffect, useRef, useState } from "react";
import {
  NOverlap,
  RandomizeNodePositions,
  RelativeSize,
  Sigma,
} from "react-sigma";
import { useNavigate } from "react-router-dom";
import ForceLink from "react-sigma/lib/ForceLink.js";
import { Bar } from "react-chartjs-2";

function Graph({ convertedData }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const sigmaRef = useRef(null);

  const hoverNodeColor = "#e44";
  const basicNodeColor = "#445";
  const rootNodeSize = 18;

  useEffect(() => {
    const updateGraphSettings = () => {
      if (!sigmaRef.current || !sigmaRef.current.sigma) {
        return;
      }

      const sigma = sigmaRef.current.sigma;
      const graph = sigma.graph;
      const nodes = graph.nodes();
      const links = graph.edges();

      // let maxCitedBy = 0;
      //
      // nodes.forEach((node) => {
      //     maxCitedBy = Math.max(maxCitedBy, node.citedby);
      //     node.size = node.citedby * 0.01 + rootNodeSize;
      // })
      //
      // nodes[0].size = maxCitedBy * 0.015 + rootNodeSize;

      links.forEach((link) => {
        link.color = basicNodeColor;
        if (link.source === "jUg1yFcAAAAJ" || link.target === "jUg1yFcAAAAJ") {
          link.size = link.common_publications * 0.3 + 0.7;
        }
      });

      const updatedLinks = links.map((link) => ({ ...link }));

      const searchRegex = new RegExp(searchQuery, "i");
      nodes.forEach((node) => {
        if (searchRegex.test(node.label)) {
          if (node.id !== "jUg1yFcAAAAJ") {
            node.color = basicNodeColor;
          } else {
            node.color = "#e44";
          }
          updatedLinks.forEach((link) => {
            if (!(link.source === node.id) && !(link.target === node.id)) {
              link.color = "#fff";
            }
          });
        }
      });

      graph.clear();
      graph.read({ nodes, edges: updatedLinks });
      sigma.refresh();
    };

    updateGraphSettings();
  }, [searchQuery]);
  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClickNode = (e) => {
    navigate(`../graph/${e.data.node.id}`, { replace: true });
  };

  const handleNodeHover = (e) => {
    const node = e.data.node;
    node.originalLabel = node.originalLabel || node.label;
    node.label = `Cited by: ${node.citedby}; H-index: ${node.hindex}`;
    sigmaRef.current.sigma.refresh();
    node.color = hoverNodeColor;
  };

  const handleNodeLeave = (e) => {
    const node = e.data.node;
    if (node.id !== "jUg1yFcAAAAJ") {
      node.color = basicNodeColor;
    } else {
      node.color = "#e44";
    }
    if (node.originalLabel) {
      node.label = node.originalLabel;
      delete node.originalLabel;
      sigmaRef.current.sigma.refresh();
    }
  };

  const renderLabel = (node) => {
    return (
      <div>
        <strong>{node.label.split("\n")[0]}</strong>
        <br />
        Cited by: {node.citedby}
      </div>
    );
  };

  return (
    <div className="graph">
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Search nodes..."
        />
      </div>
      <Sigma
        ref={sigmaRef}
        graph={convertedData}
        settings={{
          animationsTime: 1500,
          defaultLabelSize: 15,
          drawLabels: true,
          labelSize: "fixed",
          labelThreshold: 7,
          labelColor: "#fff",
          maxNodeSize: rootNodeSize,
          maxEdgeSize: 5,
          renderers: [
            {
              container: sigmaRef.current?.current?.container,
              type: "label",
              render: renderLabel,
            },
          ],
        }}
        style={{
          height: "inherit",
          width: "inherit",
        }}
        onClickNode={handleClickNode}
        onOverNode={handleNodeHover}
        onOutNode={handleNodeLeave}
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
