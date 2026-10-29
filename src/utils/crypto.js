import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);

export async function hashPassword(password) {

    const salt = crypto.randomBytes(16).toString("hex");

    const derivedKey = await scryptAsync(
        password,
        salt,
        64
    );

    const hash = derivedKey.toString("hex");

    return `${salt}:${hash}`;
}