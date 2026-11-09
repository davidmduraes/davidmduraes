const jwt = require("jsonwebtoken");

function authenticate(jwtSecret) {
  if (!jwtSecret) {
    throw new Error("A variável JWT_SECRET é obrigatória.");
  }

  return function authenticateRequest(req, res, next) {
    const match = (req.get("authorization") || "").match(/^Bearer\s+(\S+)$/i);
    if (!match) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Token Bearer ausente ou malformado.",
        },
      });
    }

    try {
      req.auth = jwt.verify(match[1], jwtSecret, { algorithms: ["HS256"] });
      return next();
    } catch {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Token inválido ou expirado.",
        },
      });
    }
  };
}

module.exports = { authenticate };
