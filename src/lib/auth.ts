import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import dbConnect from "./db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(payload: { id: string; email: string; role: string; username: string }) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is not configured. Please set it in your .env file.");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  if (!JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser() {
  await dbConnect();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  try {
    const user = await User.findById(decoded.id).select("-password");
    return user;
  } catch (e) {
    return null;
  }
}

export async function isAdmin() {
  const user = await getAuthUser();
  return user && user.role === "admin";
}
