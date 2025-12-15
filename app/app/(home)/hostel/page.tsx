import BuildingCard from "@/components/BuildingCard";
import url from "@/components/constant";
import { cookies } from "next/headers";
import Link from "next/link";

interface IHostel {
  _id: string;
  name: string;
  slug?: string;
  address: string;
  description?: string;
  maxRoom: number;
  ownerId: string;
}

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name.toLowerCase().split(" ").join("-");
}

async function getHostels(): Promise<IHostel[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token");

    const response = await fetch(`${url}/api/hostels`, {
      headers: {
        Cookie: `access_token=${token?.value}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch hostels");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function HostelPage() {
  const hostels = await getHostels();
  
  // Debug: Check if slug exists
  if (hostels.length > 0) {
    console.log("First hostel data:", hostels[0]);
  }

  return (
    <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto pt-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Hostels</h1>
            <p className="text-gray-500">Manage your properties</p>
          </div>
          <Link
            href="/hostel/add-room"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add New Hostel
          </Link>
        </div>

        {hostels.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">
              No hostels found. Create your first one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((hostel: IHostel, index: number) => (
              <BuildingCard
                key={index}
                id={hostel._id}
                slug={hostel.slug || generateSlug(hostel.name)}
                name={hostel.name}
                totalRooms={hostel.maxRoom || 0}
                occupancy={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
