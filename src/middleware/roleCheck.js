export const checkRole = (roles) => {
  return (req, res, next) => {
    console.log('Checking role...');
    console.log('User:', req.user);
    console.log(
      'User role (before conversion):',
      req.user ? req.user.role : 'No user'
    );

    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json('Unauthorized');
    }

    // Convert role to a number
    const userRole = Number(req.user.role);
    console.log('User role (after conversion):', userRole);
    console.log('Allowed roles:', roles);
    console.log('Is role included?', roles.includes(userRole));

    if (roles.includes(userRole)) {
      console.log('Role check passed');
      next();
    } else {
      console.log('Access denied. User role not in allowed roles.');
      res.status(403).json('Access denied');
    }
  };
};
