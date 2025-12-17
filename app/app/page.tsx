import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  // Check if user is already logged in
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (token) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-[#5353ec] to-[#7c3aed] rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="white"
                  className="w-7 h-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
              </div>
              <span className="text-3xl font-bold bg-linear-to-br from-[#5353ec] to-[#7c3aed] bg-clip-text text-transparent">
                WangKost
              </span>
            </div>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-6 py-2.5 text-gray-700 hover:text-[#5353ec] font-semibold transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-8 py-2.5 bg-linear-to-br from-[#5353ec] to-[#7c3aed] text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-purple-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-medium mb-8">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              #1 Hostel Management System in Indonesia
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 mb-8 leading-tight">
              Manage Your
              <br />
              <span className="bg-linear-to-br from-[#5353ec] via-[#7c3aed] to-[#5353ec] bg-clip-text text-transparent animate-gradient">
                Hostel Business
              </span>
            </h1>
            <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              All-in-one platform to manage rooms, tenants, payments, and grow
              your hostel business with powerful automation and insights.
            </p>
            <p className="text-sm text-gray-500 mt-6">
              Free forever plan available
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#5353ec] mb-2">500+</div>
              <div className="text-gray-600 font-medium">Active Hostels</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#5353ec] mb-2">10K+</div>
              <div className="text-gray-600 font-medium">Rooms Managed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#5353ec] mb-2">50K+</div>
              <div className="text-gray-600 font-medium">Happy Tenants</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#5353ec] mb-2">
                99.9%
              </div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="block text-[#5353ec]">Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to simplify your hostel management and
              boost your revenue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🏢",
                title: "Multi-Property Management",
                description:
                  "Manage unlimited hostels from one centralized dashboard. Switch between properties effortlessly.",
                color: "blue",
              },
              {
                icon: "🛏️",
                title: "Smart Room Allocation",
                description:
                  "Real-time room availability tracking with automated status updates and occupancy analytics.",
                color: "purple",
              },
              {
                icon: "👥",
                title: "Tenant Management",
                description:
                  "Complete tenant profiles with rental history, documents, and automated lease management.",
                color: "green",
              },
              {
                icon: "💰",
                title: "Payment Processing",
                description:
                  "Automated rent collection, payment reminders, and integrated payment gateway support.",
                color: "yellow",
              },
              {
                icon: "📊",
                title: "Analytics & Insights",
                description:
                  "Comprehensive reports on occupancy, revenue, and business performance with trend analysis.",
                color: "red",
              },
              {
                icon: "🔔",
                title: "Smart Notifications",
                description:
                  "Automated alerts for rent dues, lease renewals, and important business events.",
                color: "indigo",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#5353ec] hover:-translate-y-2"
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#5353ec] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-linear-to-brr from-[#5353ec] via-[#7c3aed] to-[#5353ec] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-gray-900">
            Ready to Transform Your Business?
          </h2>
          <p className="text-2xl mb-12 text-gray-900 max-w-3xl mx-auto">
            Join thousands of hostel owners who are already managing their
            properties efficiently with WangKost
          </p>
          <div className="flex items-center justify-center gap-8 mt-16 text-gray-900">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-linear-to-brr from-[#5353ec] to-[#7c3aed] rounded-xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="white"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                </div>
                <span className="text-3xl font-bold">WangKost</span>
              </div>
              <p className="text-gray-400 text-lg mb-6 max-w-md">
                The most comprehensive hostel management platform built for
                modern property owners in Indonesia.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors text-lg"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors text-lg"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors text-lg"
                  >
                    Demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors text-lg"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors text-lg"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors text-lg"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-lg">
              &copy; 2025 WangKost. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/login"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/login"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
