import * as argon2 from "argon2";

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
