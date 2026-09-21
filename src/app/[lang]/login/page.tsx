import React from "react";
import type { Metadata } from "next";
import dbConnect from "@/lib/db";
import { getSettings } from "@/lib/settings";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  await dbConnect();
  const settings = await getSettings();

  return (
    <LoginClient initialSettings={JSON.parse(JSON.stringify(settings))} />
  );
}
