import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extender el tipo Request para incluir el usuario autenticado
export interface AuthRequest extends Request {
  user?: {
    admin: boolean;
    username: string;
  };
}

// Middleware para verificar token JWT
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Token no proporcionado"
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      message: "Configuración de servidor incorrecta"
    });
    return;
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      res.status(403).json({
        success: false,
        message: "Token inválido o expirado"
      });
      return;
    }

    req.user = decoded as { admin: boolean; username: string };
    next();
  });
}
