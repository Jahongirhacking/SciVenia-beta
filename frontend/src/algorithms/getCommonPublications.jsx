export const getCommonPublications = (edges, target, source) => {
  // 1st case
  let found = edges.find(
    (edge) => edge.source === source && edge.target === target,
  );
  if (found) return found["common_publications"];
  // 2nd case
  found = edges.find(
    (edge) => edge.source === target && edge.target === source,
  );
  if (found) return found["common_publications"];
  return 0;
};
