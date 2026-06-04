# Caso de uso
## Contexto del área
El seguimiento hoy es manual en hojas de cálculo sin visibilidad centralizada
Los líderes no tienen forma rápida de ver qué está vencido o en riesgo su iniciativa
Contexto ficticio: "Área de Operaciones — Empresa de Servicios Genérica"
El equipo es de 5–10 deberá poder registrar entre 20 a 30 iniciativas en simultaneo


# Métricas de éxito
## KPIs de negocio
% de iniciativas en estado "Completado" vs total registradas
Número de iniciativas con fecha vencida aún en estado "Pendiente"
Distribución de iniciativas por prioridad (Alta / Media / Baja), mostrando el % y cantidad por prioridad
Tiempo promedio entre registro y cambio a "En curso"
Visibilidad: todos los registros accesibles sin abrir Excel
Tiempo promedio entre el registro y paso a estado completado.

# Criterios de aceptación
## El área acepta la app si...
Un usuario puede registrar una iniciativa nueva en menos de 2 minutos. (Debe ser intuitiva)
El dashboard muestra el estado actual sin necesidad de filtrar manualmente. Debe mostrar información en tiempo real
Los datos no se pierden al cerrar el browser o recargar la página
Cualquier miembro del área puede ver todas las iniciativas activas de un vistazo
La app corre sin instalación adicional — solo browser. 


## Módulos de la aplicación
### Formularios	
- El Formulario debe cumplir con los siguientes campos definidos
Nombre, responsable, estado, fecha límite, prioridad y descripción 
- Guardar registro en PostgreSQL
Al enviar el formulario, el registro se escribe en la tabla initiatives de la BD provista
### Dashboard
- Tabla que muestra registros desde la BD
Lee desde PostgreSQL — los datos mockup pre-cargados deben ser visibles sin agregar registros
- Datos persisten al recargar la página
F5 y los registros siguen visibles — vienen de PostgreSQL, no de sessionStorage ni variables
- Filtro por estado
Filtra la tabla por Pendiente / En curso / Completado
- Contadores de iniciativas por estado
Cards o badges que muestran cuántas iniciativas hay en cada estado

### Calidad
- App corre sin errores en consola del browser
Sin excepciones JavaScript ni errores de red visibles en DevTools

## Requisitos técnicos
- Debe desarrollarse en React (frontend)
- El backend debe estar en node js superior a la versión 20
- Usar la Base de datos existente en postgre sql 
- El script de la Base de datos se encuentra en el archivo mockups_aichallenge.sql
- El esquema a utilizar es el reto_a
- La solución debe cumplir con lineamiento OWASP de desarrollo seguro
- Debe cumplir con los principios de solid
- La aplicación no debe generar deuda técnica
- Considerar las mejores practicas de seguridad en temas de Api 

