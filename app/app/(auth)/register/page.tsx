/* eslint-disable prefer-const */
"use client";
import { getCookies } from "@/app/(home)/feendue/actions";
import url from "@/components/constant";
import { showError, showSuccess } from "@/components/toast";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  async function cookie() {
    const token = await getCookies();
    return token;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Format phone number with +62 prefix
    let formattedPhone = phoneNumber.trim();

    // Remove leading zero if exists
    if (formattedPhone.startsWith("0")) {
      formattedPhone = formattedPhone.substring(1);
    }

    // Remove +62 if already exists to avoid duplication
    if (formattedPhone.startsWith("+62")) {
      formattedPhone = formattedPhone.substring(3);
    } else if (formattedPhone.startsWith("62")) {
      formattedPhone = formattedPhone.substring(2);
    }

    // Add +62 prefix
    formattedPhone = `+62${formattedPhone}`;

    const resp = await fetch(`${url}/api/admin/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phoneNumber: formattedPhone,
        password,
      }),
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
        let text: string = data.message[0].split(":")[1];
        showError(text);
        return;
      }
    }

    showSuccess("Success Registrasi");
    setTimeout(() => {
      toast.dismiss();
      router.push("/login");
    }, 1000);
  }

  useEffect(() => {
    const checkAuth = async () => {
      const token = await cookie();

      if (token) {
        router.push("/dashboard");
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
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
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 mt-2">Create your new account</p>
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
                placeholder="Your Name"
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
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">+62</span>
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-black w-full pl-12 pr-4 py-3 rounded-lg border"
                  placeholder="8123456789"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Input without leading zero
              </p>
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
                placeholder="Minimal 6 karakter"
              />
            </div>

            <button
              type="submit"
              className="w-full text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              style={{ backgroundColor: "#5353ec" }}
            >
              Register
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold hover:underline"
                style={{ color: "#5353ec" }}
              >
                Login here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
