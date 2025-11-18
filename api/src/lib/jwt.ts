import jwt from 'jsonwebtoken';
const SYS_JWT_KEY = process.env.SYS_JWT_KEY;

//sample expiresIn values "1y | 2 days | 1d | 10h | 2.5 hrs"
export const generateToken = (data: any, expiresIn: string = '1d') => {
    const token = jwt.sign(data, SYS_JWT_KEY, { expiresIn: expiresIn });
    return token
}

export const decodeToken = (token: string) => {
    try {
        //if expire it will throw error
        const validated = jwt.verify(token, SYS_JWT_KEY)
    } catch { return { data: null, message: "token expired" } }

    const tokendata = jwt.decode(token);
    return { data: tokendata, message: "token decoded" }
}