var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressLayouts = require('express-ejs-layouts');
var expressSession = require('express-session');

var indexRouter = require('./routes/index');

var app = express();

// Configuración del motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Archivos estáticos originales (tu carpeta public)
app.use(express.static(path.join(__dirname, 'public')));

// --- NUEVA LÍNEA PARA BOOTSTRAP LOCAL ---
// Esto permite acceder a bootstrap en: /bootstrap/css/... y /bootstrap/js/...
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
// ----------------------------------------

// Configuración de la sesión
app.use(expressSession({
  secret: 'secret', // Recuerda cambiar esto por una variable de entorno en producción
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario;
  next();
});

// Rutas
app.use('/', indexRouter);

// Manejo de errores 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Manejador de errores
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;