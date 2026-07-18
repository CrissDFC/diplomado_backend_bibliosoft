function userDto(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.roleId,
    roleName: user.Role?.name,
    status: user.status,
  };
}

module.exports = userDto;
