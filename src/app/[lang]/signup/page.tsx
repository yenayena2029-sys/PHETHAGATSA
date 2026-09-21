import React from "react";
import type { Metadata } from "next";
import dbConnect from "@/lib/db";
import { getSettings } from "@/lib/settings";
import SignupClient from "./SignupClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function SignupPage() {
  await dbConnect();
  const settings = await getSettings();

  return (
    <SignupClient initialSettings={JSON.parse(JSON.stringify(settings))} />
  );
}
