"use client";
import url from "@/components/constant";
import { showError, showSuccess } from "@/components/Toast.ts";
import { FormEvent, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const resp = await fetch(`${url}/api/admin/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, phoneNumber, password }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      if (data.message.length > 1) {
        data.message.forEach((el: string) => {
          let text: string[] = el.split(":");
          showError(text[1]);
        });
        return;
      } else {
        showError(data.message[0]);
        return;
      }
    }

    showSuccess("Success Registrasi");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: "#5353ec" }}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Daftar Akun</h2>
            <p className="text-gray-500 mt-2">Buat akun baru Anda</p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-black mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                onChange={(e) => setName(e.target.value)}
                className="text-black w-full px-4 py-3 rounded-lg border"
                placeholder="Masukkan nama"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                className="text-black w-full px-4 py-3 rounded-lg border"
                placeholder="contoh@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phoneNumber"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-black w-full px-4 py-3 rounded-lg border"
                  placeholder="Minimal 6 karakter"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                className="text-black w-full px-4 py-3 rounded-lg border"
                placeholder="08123456789"
              />
            </div>

            <button
              type="submit"
              className="w-full text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              style={{ backgroundColor: "#5353ec" }}
            >
              Daftar Sekarang
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Sudah punya akun?{" "}
              <a
                href="/login"
                className="font-semibold hover:underline"
                style={{ color: "#5353ec" }}
              >
                Masuk di sini
              </a>
            </p>
          </div>
          <Toaster />
        </form>
      </div>
    </div>
  );
}
