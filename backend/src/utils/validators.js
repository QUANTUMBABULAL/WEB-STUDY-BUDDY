// Input validation helpers (placeholders)
exports.validateRegister = (data) => {
  const { username, password } = data;
  if (!username || !password) return { valid: false, message: 'Missing fields' };
  return { valid: true };
};

exports.validateLogin = (data) => {
  const { username, password } = data;
  if (!username || !password) return { valid: false, message: 'Missing fields' };
  return { valid: true };
};
