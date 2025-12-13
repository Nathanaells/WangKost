"use server";

import { cookies } from "next/headers";

export async function setCookie(key: string, value: string): Promise<string> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: key,
    value: value,
  });

  return "success";
}
