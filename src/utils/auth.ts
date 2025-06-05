import * as argon2 from "argon2";

export const hashPassword = async (password: string): Promise<string> => {
    const hash = await argon2.hash(password);
    return hash;
};
