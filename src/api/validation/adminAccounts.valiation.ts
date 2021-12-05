const canUpdate = (
  role1: String,
  username1: String,
  role2: String,
  username2: String
) => {
  return getPriority(role1) < getPriority(role2) || username1 === username2
    ? true
    : false;
};

// const canCreate = (
//     role1: String,
//     username1: String,
//     role2: String,
//     username2: String
//   ) => {
//     return getPriority(role1) < getPriority(role2) || username1 === username2
//       ? true
//       : false;
//   };

const getPriority = (role: String) => {
  return role == 'Administrator' ? 1 : 2;
};

export default { canUpdate };
