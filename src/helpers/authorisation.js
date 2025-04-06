const checkRole = (userRole, allowedRole = []) => {
  return allowedRole.includes(userRole);
};
export { checkRole };
