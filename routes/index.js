var express = require('express');
var router = express.Router();
var path = require('path'); // <--- 1. Necesitamos esto para las rutas de archivos

// 2. Importamos la base de datos y los modelos
const Database = require('../data/database');
const UsuarioDAO = require('../data/usuario-dao');
const TareaDAO = require('../data/tarea-dao');

// 3. Importamos el middleware de seguridad
const auth = require('../middlewares/auth');

// 4. INICIALIZAMOS LA CONEXIÓN
// Le decimos que busque 'db.sqlite' en la carpeta superior (la raíz del proyecto)
const dbPath = path.join(__dirname, '../db.sqlite'); 
const db = Database.getInstance(dbPath); // <--- ¡Aquí estaba el fallo antes!

// Inicializamos los DAOs con la conexión
const daoUsuarios = new UsuarioDAO(db);
const daoTareas = new TareaDAO(db);

/* --- RUTA PÚBLICA: LOGIN --- */
router.get('/', function(req, res, next) {
  res.render('login', { layout: 'layout' });
});

router.post('/login', async function(req, res, next) {
  const { email, password } = req.body;
  
  try {
    const usuario = await daoUsuarios.obtenerPorEmail(email); 

    if (usuario && usuario.password === password) {
      req.session.usuario = { 
        id: usuario.id, 
        email: usuario.email, 
        nombre: usuario.nombre 
      };
      res.redirect('/tareas');
    } else {
      res.render('login', { 
        layout: 'layout', 
        error: 'Credenciales incorrectas' 
      });
    }
  } catch (err) {
    console.error(err);
    res.render('login', { 
      layout: 'layout', 
      error: 'Error en el servidor al intentar iniciar sesión' 
    });
  }
});

router.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

/* --- RUTAS PRIVADAS: PANEL DE ADMINISTRACIÓN --- */

// 1. Listado de tareas
router.get('/tareas', auth, async function(req, res, next) {
  try {
    // Si tu DAO pide el ID del usuario, pásaselo. Si no, quita el argumento.
    // Asumo que obtenerTodas filtra por usuario:
    const tareas = await daoTareas.obtenerTodas(req.session.usuario.id);
    
    res.render('listado-tareas', { 
      layout: 'layout-admin', 
      tareas: tareas,
      usuario: req.session.usuario
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 2. Formulario para nueva tarea
router.get('/tareas/crear', auth, function(req, res, next) {
  res.render('formulario-tarea', { 
    layout: 'layout-admin',
    usuario: req.session.usuario
  });
});

// 3. Guardar la tarea
router.post('/tareas/insertar', auth, async function(req, res, next) {
  const { descripcion } = req.body;
  
  if(descripcion) {
    await daoTareas.insertar(descripcion, req.session.usuario.id);
  }
  
  res.redirect('/tareas');
});

// 4. Eliminar tarea
router.post('/tareas/eliminar', auth, async function(req, res, next) {
  const { id } = req.body;
  
  if(id) {
    await daoTareas.borrar(id); 
  }
  
  res.redirect('/tareas');
});

module.exports = router;