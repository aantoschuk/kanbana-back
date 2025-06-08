import * as argon2 from "argon2";
import { randomBytes } from "crypto";

// hash password
export const hashPassword = async (password: string): Promise<string> => {
    const hash = await argon2.hash(password);
    return hash;
};

// verify hashed password and provided one
export const verifyPassword = async (hash: string, password: string) => {
    try {
        return await argon2.verify(hash, password);
    } catch (err) {
        console.error("Error while verifying passing: ", err);
        return false;
    }
};

// create refresh token
export const generateRefreshToken = async () => {
    const rawToken = randomBytes(64).toString("hex");
    const hash = await argon2.hash(rawToken);
    return { rawToken, hash };
};

// accepts raw resfresh token and hash it
export const verifyRefreshToken = async (token: string, rawToken: string) => {
    return await argon2.verify(token, rawToken);
};
