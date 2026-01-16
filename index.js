const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

/* ======================
     MIDDLEWARES
   ====================== */
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ======================
     STATIC FILES
   ====================== */
app.use(express.static(path.join(__dirname, 'public')));

/* ======================
     VIEW ENGINE
   ====================== */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* ======================
     CARGA INICIAL DE DATOS (JSON)
   ====================== */
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'personal.json'), 'utf-8'));

// Añadir campo 'activo' a cada persona (para eliminación lógica)
data.personal.forEach(p => {
    if (p.activo === undefined) {
        p.activo = 1;
    }
});

// Array en memoria
app.locals.personal = data.personal;

/* ======================
     ROUTES
   ====================== */
const indexRoutes = require('./routes/index');

app.use('/', indexRoutes);

/* ======================
     ERROR HANDLING
   ====================== */

// 404
app.use((req, res, next) => {
    res.status(404).render('error', {
        message: 'Página no encontrada....'
    });
});

// 500
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Error interno del servidor...'
    });
});

/* ======================
   SERVER
   ====================== */
app.listen(PORT, () => {
    console.log(`Biblioteca UCM en ejecución en at http://localhost:${PORT}`);
});
