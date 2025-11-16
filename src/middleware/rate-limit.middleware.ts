import rateLimit from "express-rate-limit";

// Límite para búsquedas de invitados (más permisivo)
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 búsquedas por minuto
  message: { error: "Demasiadas búsquedas, espera un momento por favor" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite para confirmaciones (moderado)
export const confirmLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // 10 confirmaciones por minuto
  message: { error: "Demasiadas confirmaciones, espera un momento" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite para subir fotos (restrictivo)
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 uploads cada 15 minutos
  message: { error: "Límite de subidas alcanzado, espera 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite para ver galería (permisivo)
export const galleryViewLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // 60 requests por minuto
  message: { error: "Demasiadas peticiones, espera un momento" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite para crear invitados (muy restrictivo - solo admin)
export const createGuestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 creaciones cada 15 minutos
  message: { error: "Límite de creación alcanzado" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite general para todas las rutas
export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requests por minuto en general
  message: { error: "Demasiadas peticiones, espera un momento" },
  standardHeaders: true,
  legacyHeaders: false,
});
