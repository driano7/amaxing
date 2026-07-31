# Amaxing - Luxury Tourism Agency

Amaxing is a premium digital platform for luxury tourism experiences in Mexico, designed for discerning travelers seeking authentic cultural immersion beyond the tourist trail.

## 🚀 Features

- **Exclusive Experiences**: Curated luxury tours and activities
- **Three.js 3D Visualization**: Interactive 3D models of archaeological sites
- **Advanced Authentication**: Secure user management with email verification
- **Internationalization**: Native English and Spanish support
- **Real-time Booking**: Seamless reservation system with payment integration
- **Mobile-First Design**: Responsive design optimized for all devices
- **SEO Optimized**: Search engine optimized for global reach
- **Social Authentication**: Google, Facebook, Apple login options
- **Advanced Security**: 2FA, trusted devices, security monitoring
- **Analytics Dashboard**: Comprehensive booking and revenue insights

## 🌐 Internationalization

Amaxing supports both English (default) and Spanish, ensuring accessibility for international and local travelers.

### Language Switching

Languages can be switched via:
- **URL**: `/{lang}/experiences` (en/experiences, es/experiencias)
- **Header**: Language selector in the navigation bar
- **Browser**: Automatic detection based on Accept-Language header
- **Cookie**: Persistent language preference

### Translations

All user interface text, error messages, and content are fully translated into both languages, ensuring a consistent and localized experience for users worldwide.

## 🛠 Technology Stack

### Frontend
- Next.js 14 (App Router)
- React 19 with Server Components
- TypeScript
- Tailwind CSS
- Framer Motion
- @react-three/fiber (3D Visualization)
- @react-three/drei (3D Controls)
- React Day-Picker (Date Selection)
- Zustand (State Management)

### Backend
- PostgreSQL with Supabase
- Next.js API Routes
- JWT Authentication
- bcrypt Password Hashing
- Rate Limiting & Security
- Webhook Integration

### Authentication & Security
- Email Verification
- Password Reset Tokens
- Social Auth (Google, Facebook, Apple)
- 2-Factor Authentication
- Trusted Devices
- Security Monitoring
- Audit Trails

## 📊 Database Schema

The application features a comprehensive database schema including:

### Core Tables
- **users**: Authentication and user profiles
- **profiles**: Extended user information and preferences
- **experiences**: Luxury tour catalog
- **bookings**: Reservation management
- **payments**: Transaction processing
- **reviews**: Customer feedback and ratings
- **analytics**: Booking and revenue tracking

### Security Tables
- **login_attempts**: Security event tracking
- **password_reset_tokens**: Password recovery management
- **email_verification_tokens**: Email confirmation
- **social_auth_accounts**: OAuth provider integration
- **trusted_devices**: Device management
- **user_activity_logs**: Audit trail and compliance

## 🚀 Getting Started

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd amaxing

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Configure database
# Run the schema.sql file in your PostgreSQL database

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=your-postgresql-connection-string

# Authentication
JWT_SECRET=your-jwt-secret-key
BCRYPT_ROUNDS=12

# External Services
STRIPE_SECRET_KEY=your-stripe-secret-key
# ... other service keys

# Security
NODE_ENV=development
ALLOWED_ORIGINS=https://your-domain.com
```

## 🏗️ Project Structure

```
amaxing/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── experiences/ # Experience management
│   │   ├── bookings/    # Booking endpoints
│   │   └── payments/    # Payment processing
│   ├── components/      # UI components
│   ├── hooks/          # Custom hooks
│   └── lib/            # Libraries and utilities
├── components/          # Shared components
│   ├── ui/             # UI components
│   ├── auth/           # Authentication components
│   ├── booking/        # Booking components
│   └── experiences/   # Experience components
├── lib/                # Application libraries
│   ├── auth/          # Authentication logic
│   ├── db/            # Database utilities
│   └── i18n/          # Internationalization
├── public/             # Static assets
├── schemas/            # Database schema files
├── scripts/            # Deployment and setup scripts
└── types/             # TypeScript definitions
```

## 🔧 Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:migrate": "node scripts/db-migrate.js",
    "db:seed": "node scripts/db-seed.js",
    "db:reset": "node scripts/db-reset.js",
    "test": "jest",
    "test:auth": "jest tests/auth/",
    "test:integrations": "jest tests/integrations/"
  }
}
```

## 🌍 Localization

Amaxing is fully internationalized with support for:

### Language Detection
1. **Cookie Persistence**: Language preference stored in NEXT_LOCALE cookie
2. **Browser Headers**: Automatic detection from Accept-Language header
3. **Manual Selection**: Language switcher in the navigation
4. **Default**: English for international users, Spanish for Mexican users

### Translation Examples

#### Navigation
- **en**: "Experiences" → **es**: "Experiencias"
- **en**: "Book Now" → **es**: "Reservar Ahora"
- **en**: "Contact" → **es**: "Contacto"

#### Hero Section
- **en**: "Discover the Mexico They Never Show You." → **es**: "Descubre el México que Nunca Te Enseñan."

#### Booking Flow
- **en**: "Select Date" → **es**: "Seleccionar Fecha"
- **en**: "Proceed to Payment" → **es**: "Proceder al Pago"

## 📈 Analytics and Monitoring

The application includes comprehensive analytics and monitoring:

### User Analytics
- Booking patterns and preferences
- User engagement and retention
- Conversion rates by language and device
- Revenue tracking and forecasting

### Security Analytics
- Login attempt patterns
- Suspicious activity detection
- Failed authentication tracking
- Account security status

## 🔐 Security Features

### Authentication Security
- **Password Hashing**: bcrypt with configurable work factor
- **Session Management**: Secure JWT tokens with expiration
- **Email Verification**: Double opt-in email confirmation
- **Password Reset**: Time-limited reset tokens
- **Account Lockout**: Protection against brute force attacks

### Advanced Security
- **2-Factor Authentication**: SMS, email, and authenticator app support
- **Trusted Devices**: Manage and secure devices
- **Social Auth Integration**: Secure OAuth provider integration
- **Security Monitoring**: Real-time threat detection
- **Audit Trail**: Complete activity logging
- **Rate Limiting**: API and authentication endpoint protection

## 📱 Mobile Experience

### Responsive Design
- **Desktop**: Full-featured experience with sidebars and expanded views
- **Tablet**: Optimized layout with adaptive navigation
- **Mobile**: Touch-friendly interface with simplified flows

### Mobile Features
- **Push Notifications**: Booking confirmations and reminders
- **Offline Support**: Basic functionality with background sync
- **Biometric Auth**: Face ID and fingerprint support
- **App-like Experience**: Progressive Web App capabilities

## 🚀 Deployment

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# Database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Monitor logs
tail -f /var/log/amaxing/app.log
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

### Code Standards
- ESLint for linting
- Prettier for formatting
- TypeScript for type safety
- Jest for testing

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Follow conventional commit messages
4. Add tests for new functionality
5. Update documentation
6. Request review from maintainers

## 📞 Support

### Issues and Bug Reports
Please report issues through the GitHub issue tracker:
[https://github.com/driano7/amaxing/issues](https://github.com/driano7/amaxing/issues)

### Feature Requests
Submit feature requests through the GitHub issue tracker:
[https://github.com/driano7/amaxing/issues](https://github.com/driano7/amaxing/issues)

### Documentation
For questions about usage, configuration, or development, please refer to:
- [Documentation](https://github.com/driano7/amaxing/blob/main/AGENTS.md)
- [Codebase Readme](https://github.com/driano7/amaxing/blob/main/README.md)

## 📊 Performance Metrics

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to First Byte (TTFB)**: < 600ms

### API Performance
- **Database Query Optimization**: Indexed queries for fast lookups
- **Caching Strategy**: Redis for session and API response caching
- **CDN Integration**: Static asset optimization
- **Compression**: Gzip and Brotli for efficient data transfer

## 🎨 Design System

### Typography
- **Headings**: Inter with Playfair Display for hero text
- **Body Copy**: Inter for readability
- **UI Text**: Inter for consistency

### Color Scheme
- **Primary**: Orange (#ea580c) for CTAs and accents
- **Background**: Dark theme (zinc-950) for luxury feel
- **Text**: White with gray-300 for readability
- **Borders**: White/10 with subtle transparency

### Spacing System
- **Component**: 4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px, 128px
- **Layout**: Consistent margins and padding
- **Grid**: 12-column responsive grid

## 🔄 License

This project is licensed under the MIT License. See `LICENSE` for more information.

---

### Español (Español)

# Amaxing - Agencia de Turismo de Lujo

Amaxing es una plataforma digital premium para experiencias de turismo de lujo en México, diseñada para viajeros exigentes que buscan inmersión cultural auténtica más allá de la ruta turística.

## 🚀 Características

- **Experiencias Exclusivas**: Tours y actividades de lujo cuidadosamente seleccionados
- **Visualización 3D con Three.js**: Modelos interactivos en 3D de sitios arqueológicos
- **Autenticación Avanzada**: Gestión segura de usuarios con verificación de email
- **Internacionalización**: Soporte nativo en inglés y español
- **Reserva en Tiempo Real**: Sistema de reservación fluido con integración de pagos
- **Diseño Mobile-First**: Diseño responsivo optimizado para todos los dispositivos
- **Optimización SEO**: Optimizado para motores de búsqueda global
- **Autenticación Social**: Login con Google, Facebook, Apple
- **Seguridad Avanzada**: 2FA, dispositivos confiables, monitoreo de seguridad
- **Dashboard de Analytics**: Analisis comprehensivo de reservas y revenue

## 🌐 Internacionalización

Amaxing soporta tanto inglés (default) como español, asegurando accesibilidad para viajeros internacionales y locales.

### Selección de Idioma

Los idiomas se pueden cambiar mediante:
- **URL**: `/{lang}/experiences` (en/experiences, es/experiencias)
- **Header**: Selector de idioma en la barra de navegación
- **Browser**: Detección automática desde el header Accept-Language
- **Cookie**: Preferencia de idioma persistente

### Traducciones

Todo el texto de la interfaz de usuario, mensajes de error y contenido están completamente traducidos a ambos idiomas, asegurando una experiencia consistente y localizada para usuarios globales.

## 🛠 Stack Tecnológico

### Frontend
- Next.js 14 (App Router)
- React 19 con Components del lado del servidor
- TypeScript
- Tailwind CSS
- Framer Motion
- @react-three/fiber (Visualización 3D)
- @react-three/drei (Controles 3D)
- React Day-Picker (Selección de Fecha)
- Zustand (Gestión de Estado)

### Backend
- PostgreSQL con Supabase
- Rutas API de Next.js
- Autenticación JWT
- bcrypt Cifrado de Contraseñas
- Rate Limiting y Seguridad
- Integración de Webhooks

### Autenticación y Seguridad
- Verificación de Email
- Tokens de Reseteo de Contraseña
- Autenticación Social (Google, Facebook, Apple)
- Autenticación de Dos Factores
- Dispositivos Confiables
- Monitoreo de Seguridad
- Trazas de Auditoría

## 📊 Esquema de Base de Datos

La aplicación cuenta con un esquema de base de datos comprehensivo incluyendo:

### Tablas Principales
- **users**: Autenticación y perfiles de usuario
- **profiles**: Información extendida del usuario y preferencias
- **experiences**: Catálogo de tours de lujo
- **bookings**: Gestión de reservaciones
- **payments**: Procesamiento de transacciones
- **reviews**: Comentarios y calificaciones de clientes
- **analytics**: Analisis de reservas y revenue

### Tablas de Seguridad
- **login_attempts**: Seguimiento de eventos de seguridad
- **password_reset_tokens**: Gestión de reseteo de contraseña
- **email_verification_tokens**: Confirmación de email
- **social_auth_accounts**: Integración de OAuth provider
- **trusted_devices**: Gestión de dispositivos
- **user_activity_logs**: Traza de auditoría y cumplimiento

## 🚀 Empezando

### Inicio Rápido

```bash
# Clonar el repositorio
git clone <repository-url>
cd amaxing

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Configurar base de datos
# Ejecutar el archivo schema.sql en su PostgreSQL

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno

```env
# Base de datos
DATABASE_URL=su-conexion-postgresql

# Autenticación
JWT_SECRET=su-secreto-jwt
BCRYPT_ROUNDS=12

# Servicios externos
STRIPE_SECRET_KEY=su-secreto-stripe
# ... otras claves de servicio

# Seguridad
NODE_ENV=development
ALLOWED_ORIGINS=https://su-dominio.com
```

## 🏗️ Estructura del Proyecto

```
amaxing/
├── app/
│   ├── api/              # Rutas API
│   │   ├── auth/         # Endpoints de autenticación
│   │   ├── experiences/ # Gestión de experiencias
│   │   ├── bookings/    # Endpoints de reservas
│   │   └── payments/    # Procesamiento de pagos
│   ├── components/      # Componentes de UI
│   ├── hooks/          # Custom hooks
│   └── lib/            # Librerías y utilidades
├── components/          # Componentes compartidos
│   ├── ui/             # Componentes de UI
│   ├── auth/           # Componentes de autenticación
│   ├── booking/        # Componentes de reserva
│   └── experiences/   # Componentes de experiencias
├── lib/                # Librerías de aplicación
│   ├── auth/          # Lógica de autenticación
│   ├── db/            # Utilerías de base de datos
│   └── i18n/          # Internacionalización
├── public/             # Assets estáticos
├── schemas/            # Archivos de esquema de base de datos
├── scripts/            # Scripts de despliegue y setup
└── types/             # Definiciones TypeScript
```

## 🔧 Scripts de Desarrollo

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:migrate": "node scripts/db-migrate.js",
    "db:seed": "node scripts/db-seed.js",
    "db:reset": "node scripts/db-reset.js",
    "test": "jest",
    "test:auth": "jest tests/auth/",
    "test:integrations": "jest tests/integrations/"
  }
}
```

## 🌍 Localización

Amaxing está completamente internacionalizado con soporte para:

### Detección de Idioma
1. **Persistencia de Cookie**: Preferencia de idioma almacenada en cookie NEXT_LOCALE
2. **Headers del Browser**: Detección automática desde header Accept-Language
3. **Selección Manual**: Selector de idioma en la barra de navegación
4. **Default**: Inglés para usuarios internacionales, español para usuarios mexicanos

### Ejemplos de Traducción

#### Navegación
- **en**: "Experiences" → **es**: "Experiencias"
- **en**: "Book Now" → **es**: "Reservar Ahora"
- **en**: "Contact" → **es**: "Contacto"

#### Sección Hero
- **en**: "Discover the Mexico They Never Show You." → **es**: "Descubre el México que Nunca Te Enseñan."

#### Flujo de Reserva
- **en**: "Select Date" → **es**: "Seleccionar Fecha"
- **en**: "Proceed to Payment" → **es**: "Proceder al Pago"

## 📈 Analíticas y Monitoreo

La aplicación incluye analíticas y monitoreo comprehensivos:

### Analíticas de Usuario
- Patrones de reservación y preferencias
- Engagement y retención de usuarios
- Tasas de conversión por idioma y dispositivo
- Seguimiento de revenue y proyecciones

### Analíticas de Seguridad
- Patrones de intentos de login
- Detección de actividad sospechosa
- Seguimiento de autenticaciones fallidas
- Estado de seguridad de cuentas

## 🔐 Características de Seguridad

### Seguridad de Autenticación
- **Cifrado de Contraseñas**: bcrypt con work factor configurable
- **Gestión de Sesiones**: Tokens JWT seguros con expiración
- **Verificación de Email**: Doble opt-in para confirmación de email
- **Reseteo de Contraseña**: Tokens de reseteo con expiración limitada
- **Bloqueo de Cuenta**: Protección contra ataques de fuerza bruta

### Seguridad Avanzada
- **Autenticación de Dos Factores**: Soporte para SMS, email y authenticator apps
- **Dispositivos Confiables**: Gestión y seguridad de dispositivos
- **Integración de Autenticación Social**: OAuth seguro con providers
- **Monitoreo de Seguridad**: Detección en tiempo real de amenazas
- **Traza de Auditoría**: Registro completo de todas las acciones de usuario
- **Rate Limiting**: Protección de endpoints de API y autenticación

## 📱 Experiencia Móvil

### Diseño Responsivo
- **Desktop**: Experiencia completa con sidebars y vistas expandidas
- **Tablet**: Layout optimizado con navegación adaptable
- **Móvil**: Interfaz táctil-friendly con flujos simplificados

### Características Móviles
- **Notificaciones Push**: Confirmaciones de reserva y recordatorios
- **Soporte Offline**: Funcionalidad básica con sincronización en background
- **Autenticación Biométrica**: Soporte para Face ID y huella digital
- **Experiencia tipo App**: Capacidades Progressive Web App

## 🚀 Despliegue

### Despliegue en Producción
```bash
# Construir para producción
npm run build

# Iniciar servidor de producción
npm start

# Migraciones de base de datos
npm run db:migrate

# Sembrar datos iniciales
npm run db:seed

# Monitorear logs
tail -f /var/log/amaxing/app.log
```

### Despliegue con Docker
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribuyendo

### Estándares de Código
- ESLint para linting
- Prettier para formateo
- TypeScript para tipado seguro
- Jest para testing

### Proceso de Pull Request
1. Fork el repositorio
2. Crear una branch de feature
3. Seguir mensajes de commit convencionales
4. Agregar tests para nueva funcionalidad
5. Actualizar documentación
6. Solicitar review de maintainers

## 📞 Soporte

### Reportes de Errores y Issues
Por favor, reporte issues a través del tracker de GitHub:
[https://github.com/driano7/amaxing/issues](https://github.com/driano7/amaxing/issues)

### Solicitudes de Features
Envíe solicitudes de features a través del tracker de GitHub:
[https://github.com/driano7/amaxing/issues](https://github.com/driano7/amaxing/issues)

### Documentación
Para preguntas sobre uso, configuración o desarrollo, por favor refiérase a:
- [Documentación](https://github.com/driano7/amaxing/blob/main/AGENTS.md)
- [README del Código](https://github.com/driano7/amaxing/blob/main/README.md)

## 📊 Métricas de Performance

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to First Byte (TTFB)**: < 600ms

### Performance de API
- **Optimización de Consultas en Base de Datos**: Consultas indexadas para lookups rápidas
- **Estrategia de Caching**: Redis para sesiones y respuestas de API
- **Integración CDN**: Optimización de assets estáticos
- **Compresión**: Gzip y Brotli para transferencia eficiente de datos

## 🎨 Sistema de Diseño

### Tipografía
- **Titulares**: Inter con Playfair Display para texto hero
- **Cuerpo**: Inter para legibilidad
- **Texto UI**: Inter para consistencia

### Esquemaa de Colores
- **Primario**: Naranja (#ea580c) para CTAs y acentos
- **Fondo**: Tema oscuro (zinc-950) para feel de lujo
- **Texto**: Blanco con gray-300 para legibilidad
- **Bordes**: White/10 con transparencia sutil

### Sistema de Espaciado
- **Componente**: 4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px, 128px
- **Layout**: Márgenes y padding consistentes
- **Grid**: Grid de 12 columnas responsivo

## 🔄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver `LICENSE` para más información.

---

¡Gracias por tu interés en Amaxing! Este proyecto combina el más alto nivel de tecnología con diseño premium para crear experiencias de turismo inigualables en México.

Si tienes alguna pregunta o necesitas ayuda con el setup o desarrollo, no dudes en contactarme a través de los canales de GitHub soportados.

¡Happy coding! 🚀