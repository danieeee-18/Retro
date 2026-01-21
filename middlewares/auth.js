const auth = (req, res, next) => {
  if (req.session && req.session.usuario) {
    return next(); // El usuario está logueado, continuar
  }
  return res.redirect('/'); // Si no, mandar al login
};

module.exports = auth;