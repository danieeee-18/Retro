var express = require('express');
var router = express.Router();
var authMiddleware = require('../middlewares/auth');
var Database = require('../data/database');
const UsuarioDAO = require("../data/usuario-dao");
const TareaDAO = require('../data/tarea-dao');

// --- INICIALIZACIÓN DE LA BASE DE DATOS ---
// Esto crea el archivo db.sqlite si no existe y conecta las tablas
var db = Database.getInstance("db.sqlite");
var dao = new UsuarioDAO(db);
var datoTareas = new TareaDAO(db);


// --- RUTAS PÚBLICAS ---

/* GET home page. */
router.get('/', function(req, res, next) {
  // AQUÍ ESTABA EL ERROR: Añadimos { title: ... } para que la vista lo reconozca
  res.render('index', { title: 'Todo List App' }); 
});

/* GET Login - Formulario de acceso */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Iniciar Sesión' });
});

/* POST Login - Procesar credenciales */
router.post('/login', function(req, res, next) {
  const user = dao.findUserByEmail(req.body.name);

  // Si el usuario no existe, volvemos al inicio mostrando un error (opcionalmente)
  if(!user) {
      return res.render('index', { title: 'Usuario no encontrado' });
  }

  // Verificamos contraseña (en un caso real usaríamos hash/bcrypt)
  if(req.body.password === user.password){
    // Guardamos usuario en sesión
    req.session.user = { email: user.email, id: user.id };
    res.redirect("/admin");
  } else {
    res.render('index', { title: 'Contraseña incorrecta' });
  }
});

/* GET Logout - Cerrar sesión */
router.get('/logout', function(req, res, next) {
  req.session.user = null;
  res.redirect('/');
});


// --- RUTAS PRIVADAS (ADMIN) ---

/* GET Admin - Panel principal */
router.get('/admin', authMiddleware, function(req, res, next) {
  // Buscamos las tareas de ESTE usuario específico
  let salida = datoTareas.findTareasByUserId(req.session.user.id);
  
  res.render('admin', { 
      title: 'Panel de Administración',
      user: req.session.user, 
      layout: 'layout-admin', // Usamos el diseño diferente para admin
      tareas: salida 
  });
});

/* POST Insertar Tarea */
router.post("/tareas/insertar", authMiddleware, function(req, res, next) {
  // Guardamos la tarea vinculada al ID del usuario en sesión
  datoTareas.saveTarea(req.session.user.id, req.body.titulo, req.body.descripcion);
  res.redirect("/admin");
});

module.exports = router;