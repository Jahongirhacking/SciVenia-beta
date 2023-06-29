const jsonConverter = (data) => {
  function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

  return {
    nodes: [
      {
        id: data.me[0].id,
        isClusterNode: true,
        label: data.me[0].firstname + " " + data.me[0].lastname,
        rel_size: 180.0,
        size: 180,
        color: "#FFFFFF",
      },
    ].concat(
      data.collaborations.map((collab) => {
        return {
          // cluster_id: item.id,
          // isClusterNode: true,
          id: collab.id,
          label: collab.firstname + " " + collab.lastname,
          rank: Math.random(),
          degrees: Math.random() * 90,
        };
      })
    ),
    edges: data.collaborations
      .concat(data.me)
      .map((user) => {
        return user.collabs.map((collab) => {
          return {
            source: user.id,
            target: collab,
          };
        });
      })
      .flat()
      .filter(onlyUnique),
  };
};

export default jsonConverter;
