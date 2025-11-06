# Configuración de Galería de Fotos - Wedding Backend

## Nuevos Endpoints Implementados

### 1. POST `/gallery/upload`
Sube fotos y videos de la boda.

**Tipo de request**: `multipart/form-data`

**Parámetros (FormData)**:
- `files` (File[]) - REQUERIDO - Uno o más archivos (hasta 20 simultáneos)
- `userName` (string) - OPCIONAL - Nombre del invitado que sube
- `message` (string) - OPCIONAL - Mensaje o descripción del momento

**Validaciones**:
- Tipos permitidos: `.jpg`, `.jpeg`, `.png`, `.heic`, `.webp`, `.mp4`, `.mov`, `.avi`
- Tamaño máximo: 50MB por archivo
- Hasta 20 archivos por request

**Response exitoso (200)**:
```json
{
  "success": true,
  "message": "Archivos subidos exitosamente",
  "uploadedCount": 2,
  "files": [
    {
      "id": "uuid-1",
      "url": "https://cloudinary.com/photo1.jpg",
      "thumbnailUrl": "https://cloudinary.com/thumb_photo1.jpg",
      "type": "image",
      "userName": "Juan Pérez",
      "message": "Qué bonita ceremonia!",
      "uploadedAt": "2026-01-09T20:30:00Z"
    }
  ]
}
```

### 2. GET `/gallery/photos`
Obtiene todas las fotos/videos de la galería.

**Parámetros query (opcionales)**:
- `limit` (number) - Cantidad de resultados (default: 100)
- `offset` (number) - Para paginación (default: 0)
- `type` (string) - Filtrar por "image" o "video"

**Response exitoso (200)**:
```json
{
  "success": true,
  "total": 47,
  "photos": [
    {
      "id": "uuid-1",
      "url": "https://cloudinary.com/photo1.jpg",
      "thumbnailUrl": "https://cloudinary.com/thumb_photo1.jpg",
      "type": "image",
      "userName": "María López",
      "message": "Hermoso momento!",
      "uploadedAt": "2026-01-09T20:30:00Z",
      "width": 1920,
      "height": 1080
    }
  ]
}
```

### 3. DELETE `/gallery/photos/:id`
Elimina una foto/video de la galería (y de Cloudinary).

**Response exitoso (200)**:
```json
{
  "success": true,
  "message": "Foto eliminada exitosamente"
}
```

---

## Configuración Inicial

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### 2. Crear Cuenta en Cloudinary

1. Ve a [cloudinary.com](https://cloudinary.com) y crea una cuenta gratuita
2. En el Dashboard, encontrarás:
   - Cloud Name
   - API Key
   - API Secret
3. Copia estos valores a tu archivo `.env`

**Plan gratuito incluye**:
- 25 GB de almacenamiento
- 25 GB de ancho de banda/mes
- Transformación automática de imágenes
- Optimización automática

### 3. Ejecutar Migración de Base de Datos

Una vez configurado el `DATABASE_URL`, ejecuta:

```bash
npx prisma migrate deploy
```

O si estás en desarrollo local:

```bash
npx prisma migrate dev --name add_gallery_photos
```

### 4. Desplegar en Render

1. Ve a tu servicio en Render
2. Agrega las variables de entorno de Cloudinary:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Guarda y redeploya

---

## Testing de los Endpoints

### Upload con curl

```bash
curl -X POST https://wedding-backend-oz4p.onrender.com/gallery/upload \
  -F "files=@foto1.jpg" \
  -F "files=@foto2.jpg" \
  -F "userName=Carlos" \
  -F "message=Qué bonito momento!"
```

### Get photos

```bash
# Todas las fotos
curl https://wedding-backend-oz4p.onrender.com/gallery/photos

# Solo imágenes
curl https://wedding-backend-oz4p.onrender.com/gallery/photos?type=image

# Con paginación
curl "https://wedding-backend-oz4p.onrender.com/gallery/photos?limit=20&offset=0"
```

### Delete photo

```bash
curl -X DELETE https://wedding-backend-oz4p.onrender.com/gallery/photos/uuid-aqui
```

---

## Estructura de Archivos Creados

```
wedding_backend/
├── prisma/
│   └── schema.prisma (actualizado con GalleryPhoto)
├── src/
│   ├── config/
│   │   └── cloudinary.ts (nueva)
│   ├── controllers/
│   │   └── gallery.controller.ts (nueva)
│   ├── middleware/
│   │   └── upload.middleware.ts (nueva)
│   ├── routes/
│   │   └── gallery.routes.ts (nueva)
│   ├── services/
│   │   └── gallery.service.ts (nueva)
│   └── app.ts (actualizado)
├── uploads/ (se crea automáticamente)
└── .env.example (creado)
```

---

## Dependencias Instaladas

```json
{
  "dependencies": {
    "cloudinary": "^2.x.x",
    "multer": "^1.x.x",
    "uuid": "^x.x.x"
  },
  "devDependencies": {
    "@types/multer": "^1.x.x"
  }
}
```

---

## Características Implementadas

✅ Upload múltiple de archivos (hasta 20 simultáneos)
✅ Validación de tipos de archivo
✅ Límite de tamaño (50MB)
✅ Almacenamiento en Cloudinary
✅ Generación automática de thumbnails
✅ Optimización automática de imágenes
✅ Soporte para videos
✅ Metadata de usuario opcional (userName, message)
✅ Paginación en listado de fotos
✅ Filtrado por tipo (image/video)
✅ Eliminación de fotos (incluye Cloudinary)
✅ Timestamps automáticos

---

## Siguientes Pasos (Opcionales)

- [ ] Implementar moderación de contenido
- [ ] Agregar sistema de likes
- [ ] Endpoint para descargar todas las fotos en ZIP
- [ ] Rate limiting por IP
- [ ] Webhooks para notificaciones
- [ ] Compresión adicional antes de subir

---

## Notas Importantes

1. **Directorio uploads/**: Se crea automáticamente y almacena archivos temporalmente antes de subirlos a Cloudinary. Los archivos se eliminan después de procesar.

2. **Thumbnails**: Se generan automáticamente:
   - Imágenes: 400x400 con crop
   - Videos: Frame del segundo 0, 400x400

3. **Seguridad**: No se incluye autenticación. Considera agregar middleware de autenticación si es necesario.

4. **Producción**: Asegúrate de tener las variables de entorno configuradas en Render antes de hacer push.

---

## Soporte

Si encuentras algún problema, revisa:
1. Logs de Render
2. Variables de entorno configuradas correctamente
3. Credenciales de Cloudinary válidas
4. Migración de base de datos ejecutada
