import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpResponseStatus } from '../lib/utitlity';
import { decodeToken } from '../lib/jwt';

export interface AuthenticatedRequest extends Request {
    user?: any | jwt.JwtPayload;
}

// Higher-order function to create the middleware with role-based access
export const checkAuthorization = (roles: string[] = [], checkIsAuthenticate = false) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.split(' ')[1]; //"Bearer <token>"
            if (!token) {
                return res.status(HttpResponseStatus.NOT_AUTHORIZED).json({ message: 'Access denied. No token provided.' });
            }

            const resTData: any = decodeToken(token).data;
            if (!resTData) { return res.status(HttpResponseStatus.NOT_AUTHORIZED).json({ message: 'Invalid or expired token.' }); }

            req.user = resTData;

            // If roles are provided, check if the user has the required role
            if (roles.length && !roles.includes(resTData.role)) {
                return res.status(HttpResponseStatus.NOT_AUTHORIZED).json({ message: 'Access denied. Insufficient permissions.' });
            }

            next();
        } catch (error) {
            return res.status(HttpResponseStatus.NOT_AUTHORIZED).json({ message: 'Invalid or expired token.' });
        }
    };
};
