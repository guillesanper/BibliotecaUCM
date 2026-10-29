# BibliotecaUCM

Aplicación web renderizada en servidor para gestionar el personal de una biblioteca
universitaria. Desarrollada con **Node.js + Express 5 + EJS** como ejercicio de la asignatura
Aplicaciones Web (UCM); el enunciado está en [`2025_26_Examen_Ord.pdf`](2025_26_Examen_Ord.pdf).

**Stack:** Node.js · Express 5 · EJS · Bootstrap 5 · jQuery UI · express-validator · Multer · Underscore

## Funcionalidades

- **Listado de personal** con filtros por turno, identificador y nombre.
- **Alta y edición** con formularios validados en servidor (`express-validator`) y subida de
  fotografía con **Multer**.
- **Borrado lógico**: las bajas se marcan como inactivas en lugar de eliminarse.
- **API REST** `GET /api/personal`, que devuelve en JSON el personal activo.
- **Página de accesibilidad**: tamaño de texto y combinación de colores configurables, que se
  conservan entre visitas mediante cookies.

## Puesta en marcha

Requisitos: Node.js 18 o superior.

```bash
git clone https://github.com/guillesanper/BibliotecaUCM.git
cd BibliotecaUCM
npm install
node index.js
```

La aplicación queda disponible en <http://localhost:3000>.

## Rutas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Página de inicio |
| GET / POST | `/listado` | Listado y filtrado del personal |
| GET | `/listado/:id` | Detalle de una persona |
| GET / POST | `/alta` | Formulario de alta |
| GET / POST | `/editar/:id` | Formulario de edición |
| GET | `/eliminar/:id` | Baja lógica |
| GET | `/api/personal` | Personal activo en JSON |
| GET / POST | `/accesibilidad` | Preferencias de accesibilidad |

## Estructura

```
BibliotecaUCM/
├── index.js            # Configuración de Express y arranque del servidor
├── routes/index.js     # Rutas, validaciones y lógica de la aplicación
├── views/              # Plantillas EJS
├── public/             # CSS, JS y fotografías del personal (destino de las subidas)
└── data/personal.json  # Datos iniciales del personal
```

## Autor

Guillermo Sánchez — [GitHub](https://github.com/guillesanper) · [Web](https://guillesanper.github.io)
