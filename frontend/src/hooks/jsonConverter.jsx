const jsonConverter = (data) => {
  function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

  return {
    nodes: [
      {
        id: data.me[0].firstname + " " + data.me[0].lastname,
        isClusterNode: true,
        label: data.me[0].firstname + " " + data.me[0].lastname,
        rel_size: 180.0,
        size: 180,
        color: "#FFFFFF",
      },
    ].concat(
      data.collaborations.map((collab) => {
        return {
          id: collab.firstname + " " + collab.lastname,
          label: collab.firstname + " " + collab.lastname,
          rank: Math.random(),
          degrees: Math.random() * 360,
          color: "#FFFFFF",
        };
      }),
    ),
    edges: data.collaborations
      .map((user) => {
        return {
          id: "id" + data.me[0].id + "-" + "id" + user.id,
          source: data.me[0].firstname + " " + data.me[0].lastname,
          target: user.firstname + " " + user.lastname,
        };
      })
      .flat()
      .filter(onlyUnique),
  };
};

export default jsonConverter;
