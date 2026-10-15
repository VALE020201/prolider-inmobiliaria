# 🏡 ProLíder Inmobiliaria — Plataforma Web Luxury & CRM Inmobiliario

Plataforma web inmobiliaria moderna, ultra-rápida, 100% funcional y responsive (Mobile-First) diseñada para resolver la gestión, captación y publicación exhaustiva de inmuebles por parte de los asesores, conectándolos con compradores e inquilinos mediante un portal público de alto nivel.

Inspirada en la identidad corporativa y datos reales de **[ProLíder Venezuela](https://proliderve.com/)**.

---

## 🎨 Identidad Visual y Paleta de Colores

La plataforma utiliza una escala armónica de lujo y exclusividad:
* **Verde Militar (`#2f3624` / `#434f2e` / `#171b12`)**: Seguridad jurídica, solidez y prestigio en cabeceras, botones principales, tarjetas y backoffice.
* **Dorado Satinado (`#d4b25e` / `#dfc270` / `#ebd9a0`)**: Acentos de exclusividad, medidor de calidad, insignias y botones de acción.
* **Beige Suave & Marfil (`#faf8f5` / `#f5f0e8` / `#ede4d5`)**: Fondos cálidos y elegantes que destacan las fotografías arquitectónicas.
* **Tipografía**: Combinación de **Manrope** (legibilidad geométrica y moderna) y **Fraunces** (serif sofisticada para títulos de alto impacto).

---

## 🏛️ Módulos de la Plataforma

### 1. Portal Público (Para Compradores e Inquilinos)
* **Página de Inicio (Home)**:
  * Selector de operación de un solo clic entre **Comprar** y **Alquilar**.
  * Selector rápido de tipos con botones píldora (*Casa, Penthouse, Townhouse, Apartamento, Local comercial, Terreno, Galpón, Oficina, etc.*).
  * Filtros por municipios de Carabobo, rango de precio en USD y cantidad de habitaciones.
  * Catálogo de propiedades destacadas con estatus comercial y amenidades clave.
  * **Simulador de Cotización Automática en vivo**: Estructura de desembolso por etapas de compraventa (Reserva, Opción y Registro SAREN) o presupuesto de entrada en alquiler.
  * Sección "Nuestros Asesores" con acceso a perfiles y catálogo asignado.
  * Formulario de captación para propietarios que desean vender o alquilar.
* **Catálogo Completo (`#/propiedades`)**:
  * Filtros reactivos en tiempo real con panel *drawer* para teléfonos móviles.
  * Píldoras de filtros activos y alternador de vista cuadrícula / lista.
* **Vista de Detalle Profunda (`#/propiedad/:id`)**:
  * Galería de alta resolución con selector interactivo y visor **Lightbox a pantalla completa** con soporte táctil (swipe) y teclado.
  * Ficha técnica exhaustiva (metrajes de construcción y terreno, habitaciones, baños, puestos, condición, año, niveles).
  * Amenidades agrupadas (*Seguridad 24h, Pozo de agua, Planta eléctrica, Piscina, Parrillera, etc.*).
  * **Módulo de Cotización Automática integrado**: Desglose transparente en 3 etapas de compra (10% Reserva, 40% Opción, 50% Saldo contra Registro SAREN) o presupuesto de entrada en alquiler (depósito en garantía + adelanto + honorarios y contrato), junto con la estimación de aranceles de registro SAREN (~2.5%).
  * Mapa visual corporativo de ubicación aproximada.
  * Tarjeta de contacto directo del asesor asignado con enlace pre-redactado de WhatsApp y llamada.
  * **Sistema de Ofertas Económicas Formales**: Formulario donde los clientes registrados envían su propuesta económica y condiciones de pago al asesor.
* **Directorio de Asesores (`#/asesores` y `#/asesores/:id`)**:
  * Buscador de asesores y perfil individual con biografía, redes sociales y sus inmuebles asignados.
* **Portal del Cliente (`#/mi-cuenta`)**:
  * Seguimiento de ofertas, respuestas de asesores, aceptación de contraofertas y favoritos guardados.
* **Simulador de Valoración Inmobiliaria para Propietarios (`#/valorar`)**:
  * Formulario exhaustivo donde el propietario indica tipo (Casa, Apartamento, Penthouse, Townhouse, etc.), operación (Venta/Alquiler), ubicación, m² de construcción y terreno, distribución (habitaciones, baños, puestos techados), nivel y estado.
  * Selector interactivo de **electrodomésticos y línea blanca que deja** (nevera, cocina, horno, campana, lavadora, secadora, aires acondicionados split, tanque con bomba, etc.).
  * Selección de bondades críticas (Pozo de agua, Planta eléctrica 100%, Gas directo, Vigilancia 24/7).
  * **Motor de simulación algorítmica en tiempo real** con estimación de rango de mercado y termómetro de liquidez/demanda.
  * **Conexión directa a WhatsApp**: Construye y envía el reporte estructurado directamente al WhatsApp del asesor (asignando preferiblemente a **Ana Gabriela Farfán** o seleccionando un asesor aleatorio del equipo ProLíder).

---

### 💼 2. Panel de Asesores (Backoffice / CRM Simplificado)
* **Autenticación Segura (`#/asesor/login`)**:
  * Selector rápido de demostración para acceder como cualquier asesor real de ProLíder (*Jenny Ruiz, Carolina López, Alí Mendoza, Sergio Ojeda, etc.*) o como **Gerencia General** (Admin).
* **Dashboard Operativo (`#/asesor`)**:
  * Métricas en tiempo real: Inmuebles disponibles, reservados, vendidos/alquilados, ofertas pendientes y vistas acumuladas.
  * Alertas de propuestas económicas que requieren respuesta inmediata.
* **Gestión de Propiedades (`#/asesor/inmuebles`)**:
  * Filtros por estatus (*Disponible, Reservado, Vendido, Alquilado, Borrador*).
  * Cambio de estatus con un solo clic directamente desde la tabla.
  * Botón para **duplicar inmueble como borrador** con nuevo correlativo automático.
* **CRUD de Inmuebles Exhaustivo (`#/asesor/inmuebles/nuevo`)** *(Punto Crítico Solucionado)*:
  * **Medidor de Calidad y Completitud en Tiempo Real (0% a 100%)**.
  * Selector de Operación (*Venta, Alquiler, Venta/Alquiler*) y Categoría (*prefijos correlativos automáticos como LDC, LDA, LDPH, LDTH, etc.*).
  * Botón de **"Cargar plantilla oficial ProLíder"** para autocompletar la descripción comercial.
  * Ubicación completa con estados de Venezuela, municipios, sector y coordenadas.
  * Ficha arquitectónica con metrajes, habitaciones, baños, puestos techados y condición.
  * Selector de amenidades categorizadas por chips (*Seguridad, Agua y Energía, Áreas comunes, Interiores*).
  * **Zona de Carga Multimedia Drag & Drop**: Soporta arrastrar múltiples fotos a la vez, con **compresión automática en el cliente**, selector de foto de portada y enlaces de tour virtual 360° / video.
  * Registro de datos internos de captación (*propietario, teléfono y comisión*).
* **Mesa de Negociación de Ofertas (`#/asesor/ofertas`)**:
  * Comparativa entre monto ofertado y precio de lista.
  * Botones de acción formal: **Aceptar oferta** (con reserva automática del inmueble), **Contraofertar** (enviando nuevo monto y mensaje) o **Rechazar**.
  * Historial y cronología completa de la negociación.

---

## 🛠️ Tecnologías y Arquitectura

* **Frontend**: HTML5 Semántico, CSS3 Vanilla con variables Luxury, Tailwind CSS.
* **Enrutamiento**: Router SPA basado en Hash (`#/`), sin dependencias y ejecutable localmente sin servidor.
* **Iconografía**: Set SVG vectorial inline Lucide-style libre de dependencias externas.
* **Almacenamiento Local**:
  * `localStorage`: Persistencia de catálogos, inmuebles, usuarios, ofertas, notificaciones y favoritos.
  * `IndexedDB`: Motor multimedia que almacena fotos, planos y videos de alta resolución sin saturar la memoria local.
* **Datos Semilla**: 23 asesores y 29 inmuebles reales normalizados y optimizados desde el sitio oficial de ProLíder Venezuela.

---

## 🚀 Instalación y Uso Local

No requiere configuración de base de datos ni compiladores.

1. Clona el repositorio:
   ```bash
   git clone https://github.com/VALE020201/prolider-inmobiliaria.git
   cd prolider-inmobiliaria
   ```

2. Abre directamente `index.html` en tu navegador, o inicia un servidor local con Python:
   ```bash
   python -m http.server 5500
   ```
   Luego ingresa a `http://localhost:5500`.

---

© 2026 ProLíder Inmobiliaria. Desarrollado con excelencia técnica y arquitectura moderna.
