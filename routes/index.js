const express = require('express');
const router = express.Router();
const _ = require('underscore');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para subida de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'imagenes'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage ,

});

// Validaciones para el formulario de alta/edición
const validacionesPersonal = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .trim(),
    body('email')
        .notEmpty().withMessage('El correo electrónico es obligatorio')
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .custom((value) => {
            if (!value.endsWith('@ucm.es')) {
                throw new Error('El correo debe pertenecer al dominio @ucm.es');
            }
            return true;
        }),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 6, max: 10 }).withMessage('La contraseña debe tener entre 6 y 10 caracteres')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
        .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
        .matches(/\d/).withMessage('La contraseña debe contener al menos un dígito')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('La contraseña debe contener al menos un carácter especial'),
    body('turno')
        .notEmpty().withMessage('El turno es obligatorio')
        .isIn(['mañana', 'tarde']).withMessage('El turno debe ser mañana o tarde')
];

// Validaciones para edición (contraseña opcional)
const validacionesEdicion = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .trim(),
    body('email')
        .notEmpty().withMessage('El correo electrónico es obligatorio')
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .custom((value) => {
            if (!value.endsWith('@ucm.es')) {
                throw new Error('El correo debe pertenecer al dominio @ucm.es');
            }
            return true;
        }),
    body('password')
        .optional({ checkFalsy: true })
        .isLength({ min: 6, max: 10 }).withMessage('La contraseña debe tener entre 6 y 10 caracteres')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
        .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
        .matches(/\d/).withMessage('La contraseña debe contener al menos un dígito')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('La contraseña debe contener al menos un carácter especial'),
    body('turno')
        .notEmpty().withMessage('El turno es obligatorio')
        .isIn(['mañana', 'tarde']).withMessage('El turno debe ser mañana o tarde')
];

/* ======================
   PREGUNTA 1: LISTADO Y FILTROS
   ====================== */

// GET /listado - Listado con filtro por turno (query string)
router.get('/listado', (req, res) => {
    const personal = req.app.locals.personal;
    const turnoFiltro = req.query.turno;

    // Filtrar solo activos
    let resultado = _.filter(personal, (p) => p.activo === 1);

    // Aplicar filtro por turno si existe
    if (turnoFiltro && turnoFiltro !== '') {
        resultado = _.filter(resultado, (p) => p.turno === turnoFiltro);
    }

    res.render('listado', {
        personal: resultado,
        todosPersonal: _.filter(personal, (p) => p.activo === 1),
        turnoSeleccionado: turnoFiltro || '',
        nombreBuscado: ''
    });
});

// GET /listado/:id - Filtro por identificador (URL paramétrica)
router.get('/listado/:id', (req, res) => {
    const personal = req.app.locals.personal;
    const id = parseInt(req.params.id);

    // Buscar persona por ID usando underscore
    const persona = _.findWhere(personal, { id: id, activo: 1 });

    if (!persona) {
        return res.status(404).render('error', { message: 'Persona no encontrada' });
    }

    res.render('listado', {
        personal: [persona],
        todosPersonal: _.filter(personal, (p) => p.activo === 1),
        turnoSeleccionado: '',
        nombreBuscado: ''
    });
});

// POST /listado - Filtro por nombre (búsqueda parcial, case-insensitive)
router.post('/listado', (req, res) => {
    const personal = req.app.locals.personal;
    const nombreBuscado = req.body.nombre || '';

    // Filtrar activos y por nombre usando underscore
    let resultado = _.filter(personal, (p) => {
        return p.activo === 1 &&
               p.nombre.toLowerCase().includes(nombreBuscado.toLowerCase());
    });

    res.render('listado', {
        personal: resultado,
        todosPersonal: _.filter(personal, (p) => p.activo === 1),
        turnoSeleccionado: '',
        nombreBuscado: nombreBuscado
    });
});

/* ======================
   PREGUNTA 2: ALTA, MODIFICACIÓN Y ELIMINACIÓN
   ====================== */

// GET /alta - Mostrar formulario de alta
router.get('/alta', (req, res) => {
    res.render('alta', { errores: {}, datos: {} });
});

// POST /alta - Procesar alta con validación
router.post('/alta', upload.single('imagen'), validacionesPersonal, (req, res) => {
    const errores = validationResult(req).mapped();

    if (Object.keys(errores).length > 0) {
        return res.render('alta', {
            errores: errores,
            datos: req.body
        });
    }

    const personal = req.app.locals.personal;

    // Obtener el siguiente ID consecutivo
    const maxId = _.max(personal, (p) => p.id).id || 0;

    // Crear nuevo registro
    const nuevoPersonal = {
        id: maxId + 1,
        nombre: req.body.nombre,
        email: req.body.email,
        password: req.body.password,
        turno: req.body.turno,
        imagen: req.file ? req.file.filename : '',
        activo: 1
    };

    personal.push(nuevoPersonal);

    res.redirect('/listado');
});

// GET /editar/:id - Mostrar formulario de edición precargado
router.get('/editar/:id', (req, res) => {
    const personal = req.app.locals.personal;
    const id = parseInt(req.params.id);

    const persona = _.findWhere(personal, { id: id });

    if (!persona) {
        return res.status(404).render('error', { message: 'Persona no encontrada' });
    }

    res.render('editar', {
        errores: {},
        datos: persona
    });
});

// POST /editar/:id - Procesar edición
router.post('/editar/:id', upload.single('imagen'), validacionesEdicion, (req, res) => {
    const personal = req.app.locals.personal;
    const id = parseInt(req.params.id);

    const persona = _.findWhere(personal, { id: id });

    if (!persona) {
        return res.status(404).render('error', { message: 'Persona no encontrada' });
    }

    const errores = validationResult(req).mapped();

    if (Object.keys(errores).length > 0) {
        return res.render('editar', {
            errores: errores,
            datos: { ...persona, ...req.body }
        });
    }

    // Actualizar datos
    persona.nombre = req.body.nombre;
    persona.email = req.body.email;
    persona.turno = req.body.turno;

    // Actualizar contraseña solo si se proporciona
    if (req.body.password && req.body.password.trim() !== '') {
        persona.password = req.body.password;
    }

    // Actualizar imagen si se sube una nueva
    if (req.file) {
        persona.imagen = req.file.filename;
    }

    // Actualizar estado activo/inactivo
    persona.activo = req.body.activo === '1' ? 1 : 0;

    res.redirect('/listado');
});

// GET /eliminar/:id - Eliminación lógica
router.get('/eliminar/:id', (req, res) => {
    const personal = req.app.locals.personal;
    const id = parseInt(req.params.id);

    const persona = _.findWhere(personal, { id: id });

    if (!persona) {
        return res.status(404).render('error', { message: 'Persona no encontrada' });
    }

    // Eliminación lógica: cambiar activo a 0
    persona.activo = 0;

    res.redirect('/listado');
});

/* ======================
   PREGUNTA 3: API Y ACCESIBILIDAD
   ====================== */

// GET /api/personal - Servicio REST que devuelve JSON
router.get('/api/personal', (req, res) => {
    const personal = req.app.locals.personal;

    // Filtrar solo activos y mapear campos requeridos
    const activos = _.filter(personal, (p) => p.activo === 1);
    const resultado = _.map(activos, (p) => ({
        id: p.id,
        nombre: p.nombre,
        correo: p.email,
        turno: p.turno
    }));

    res.json(resultado);
});

// GET /accesibilidad - Página de opciones de accesibilidad
router.get('/accesibilidad', (req, res) => {
    // Leer preferencias de cookies
    const bgColor = req.cookies.bgColor || '#ffffff';
    const textColor = req.cookies.textColor || '#000000';
    const fontSize = req.cookies.fontSize || '16';

    res.render('accesibilidad', {
        bgColor: bgColor,
        textColor: textColor,
        fontSize: fontSize
    });
});

// POST /accesibilidad - Guardar preferencias en cookies
router.post('/accesibilidad', (req, res) => {
    const { bgColor, textColor, fontSize } = req.body;

    // Guardar preferencias en cookies (desde el servidor)
    res.cookie('bgColor', bgColor, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 año
    res.cookie('textColor', textColor, { maxAge: 365 * 24 * 60 * 60 * 1000 });
    res.cookie('fontSize', fontSize, { maxAge: 365 * 24 * 60 * 60 * 1000 });

    res.render('accesibilidad', {
        bgColor: bgColor,
        textColor: textColor,
        fontSize: fontSize
    });
});

// Ruta raíz - redirigir a listado
router.get('/', (req, res) => {
    res.redirect('/listado');
});

module.exports = router;
