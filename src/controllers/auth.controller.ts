import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const AuthController = {
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      // Validar que se envíen credenciales
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Usuario y contraseña son requeridos",
        });
      }

      // Obtener credenciales desde variables de entorno
      const validUsername = process.env.ADMIN_USERNAME;
      const validPassword = process.env.ADMIN_PASSWORD;
      const validUsernameAlt = process.env.ADMIN_USERNAME_ALT;
      const validPasswordAlt = process.env.ADMIN_PASSWORD_ALT;
      const jwtSecret = process.env.JWT_SECRET;

      // Validar que existan las variables de entorno
      if (!jwtSecret) {
        return res.status(500).json({
          success: false,
          message: "Configuración de servidor incorrecta",
        });
      }

      // Verificar credenciales principales o alternativas
      const isValidPrimary = username === validUsername && password === validPassword;
      const isValidAlt = username === validUsernameAlt && password === validPasswordAlt;

      if (isValidPrimary || isValidAlt) {
        // Generar token JWT
        const token = jwt.sign(
          { admin: true, username },
          jwtSecret,
          { expiresIn: "24h" } // El token expira en 24 horas
        );

        return res.json({
          success: true,
          token,
          message: "Autenticación exitosa",
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Usuario o contraseña incorrectos",
        });
      }
    } catch (error) {
      console.error("Error en login:", error);
      return res.status(500).json({
        success: false,
        message: "Error en el servidor",
      });
    }
  },
};
