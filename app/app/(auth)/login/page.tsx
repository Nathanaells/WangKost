"use client";
import { useEffect, useState } from "react";
import { showError, showSuccess } from "@/components/toast";
import url from "@/components/constant";
import { setCookie } from "@/app/(auth)/login/action";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getCookies } from "@/app/(home)/feendue/actions";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  async function cookie() {
    const token = await getCookies();
    return token;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Format phone number with +62 prefix
    let formattedPhone = phoneNumber.trim();

    // Remove leading 0 if exists
    if (formattedPhone.startsWith("0")) {
      formattedPhone = formattedPhone.substring(1);
    }

    // Remove +62 or 62 if already exists
    if (formattedPhone.startsWith("+62")) {
      formattedPhone = formattedPhone.substring(3);
    } else if (formattedPhone.startsWith("62")) {
      formattedPhone = formattedPhone.substring(2);
    }

    // Add +62 prefix
    formattedPhone = "+62" + formattedPhone;

    const resp = await fetch(`${url}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ phoneNumber: formattedPhone, password }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      // Handle error messages
      if (Array.isArray(data.message)) {
        // If message is an array
        data.message.forEach((el: string) => {
          if (el.includes(":")) {
            const text: string[] = el.split(":");
            showError(text[1].trim());
          } else {
            showError(el);
          }
        });
      } else if (typeof data.message === "string") {
        // If message is a string
        showError(data.message);
      } else {
        // Fallback
        showError("Invalid phone number or password");
      }
      return;
    }

    setCookie("access_token", data.access_token);

    showSuccess("Success Login");
    setTimeout(() => {
      toast.dismiss();
      router.push("/dashboard");
    }, 1000);
  };

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
        <div className="bg-white rounded-2xl shadow-xl p-8">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome</h2>
            <p className="text-gray-500 mt-2">Log in to your account</p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-black mb-2"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">+62</span>
                </div>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-black w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-opacity-50 outline-none transition"
                  placeholder="8123456789"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-black mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-black w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-opacity-50 outline-none transition pr-12"
                  placeholder="Masukkan password"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              type="submit"
              className="w-full text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              style={{ backgroundColor: "#5353ec" }}
            >
              Masuk
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <a
                href="/register"
                className="font-semibold hover:underline"
                style={{ color: "#5353ec" }}
              >
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
