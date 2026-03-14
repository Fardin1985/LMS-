import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    
    if (!decode) {
      return res.status(401).json({
        message: "Invalid token",
        success: false
      });
    }

    // ✅ FIXED: Check for both 'userId' AND 'id' just in case
    req.id = decode.userId || decode.id; 

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
        message: "Internal server error", 
        success: false 
    });
  }
};

export default isAuthenticated;