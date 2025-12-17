import url from "@/components/constant";
import { cookies } from "next/headers";
import Link from "next/link";
import AddTenantButton from "./AddTenantButton";
import AddAdditionalButton from "./AddAdditionalButton";
import EditTenantButton from "./EditTenantButton";
import Rent from "@/server/models/Rent";
import { ObjectId } from "mongodb";

interface IAdditional {
  _id: string;
  name: string;
  price: number;
}

interface ITenant {
  _id: string;
  name: string;
  email: string;
  birthday: string;
  phoneNumber: string;
  isActive: boolean;
}

interface IRent {
  _id: string;
  price: number;
  roomId: string;
  tenantId: string;
  joinAt: string;
  leaveAt?: string;
  tenant?: ITenant;
  additionals?: IAdditional[];
}

interface IRoom {
  _id: string;
  fixedCost: number;
  isAvailable: boolean;
  hostelId: string;
  rent?: IRent;
}

interface ITransaction {
  _id: string;
  roomId: string;
  tenantId: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface IProps {
  params: Promise<{ slug: string; roomId: string }>;
}

async function getRoomDetail(
  slug: string,
  roomId: string
): Promise<IRoom | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token");

    const response = await fetch(`${url}/api/hostels/${slug}/rooms/${roomId}`, {
      headers: {
        Cookie: `access_token=${token?.value}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch room:", response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching room:", error);
    return null;
  }
}

async function getRentByRoomId(roomId: string): Promise<IRent | null> {
  try {
    const roomObjectId = new ObjectId(roomId);

    // Query database directly using the Rent model
    const rentData = await Rent.where("roomId", roomObjectId).first();

    if (!rentData) {
      return null;
    }

    // Create rent object with proper typing
    const rent: IRent = {
      _id: rentData._id.toString(),
      price: rentData.price,
      roomId: rentData.roomId.toString(),
      tenantId: rentData.tenantId.toString(),
      joinAt: rentData.joinAt,
      leaveAt: rentData.leaveAt,
      additionals: [],
    };

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token");

    // Fetch tenant data
    const tenantResponse = await fetch(`${url}/api/tenants/${rent.tenantId}`, {
      headers: {
        Cookie: `access_token=${token?.value}`,
      },
      cache: "no-store",
    });

    if (tenantResponse.ok) {
      rent.tenant = await tenantResponse.json();
    }

    // Fetch rent additionals using GET endpoint which doesn't require auth
    try {
      const additionalsResponse = await fetch(
        `${url}/api/rents/${rent._id}/rentAdditionals`,
        {
          cache: "no-store",
        }
      );

      if (additionalsResponse.ok) {
        const rentWithAdditionals = await additionalsResponse.json();
        rent.additionals = Array.isArray(rentWithAdditionals.additionals)
          ? rentWithAdditionals.additionals
          : [];
      }
    } catch (error) {
      console.error("Error fetching rent additionals:", error);
      rent.additionals = [];
    }

    return rent;
  } catch (error) {
    console.error("Error fetching rent:", error);
    return null;
  }
}

async function getAdditionals(): Promise<IAdditional[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token");

    if (!token) {
      return [];
    }

    // Decode token to get owner ID
    const jwt = await import("jsonwebtoken");
    const decoded = jwt.verify(
      token.value,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    const response = await fetch(`${url}/api/additionals`, {
      headers: {
        Cookie: `access_token=${token.value}`,
        "x-owner-id": decoded.userId,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch additionals:", response.status);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching additionals:", error);
    return [];
  }
}

async function getLatestTransaction(
  roomId: string
): Promise<ITransaction | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token");

        const response = await fetch(`${url}/api/transaction`, {
            headers: {
                Cookie: `access_token=${token?.value}`,
            },
            cache: 'no-store',
        });

    if (!response.ok) {
      return null;
    }

        const transactions: ITransaction[] = await response.json();

    // Filter transactions for this room and sort by createdAt to get the latest
    const roomTransactions = transactions
      .filter((t) => t.roomId?.toString() === roomId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return roomTransactions.length > 0 ? roomTransactions[0] : null;
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return null;
  }
}

export default async function RoomDetailPage(props: IProps) {
  const { slug, roomId } = await props.params;

  const room = await getRoomDetail(slug, roomId);
  const rent = await getRentByRoomId(roomId);
  const allAdditionals = await getAdditionals();
  const latestTransaction = await getLatestTransaction(roomId);

  if (!room) {
    return (
      <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto pt-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Room Not Found
            </h1>
            <Link
              href={`/hostel/${slug}`}
              className="text-blue-600 hover:underline"
            >
              Back to Hostel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-20 sm:ml-64 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto pt-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={`/hostel/${slug}`}
            className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Back to Hostel
          </Link>
        </div>

        {/* Room Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Room Details
              </h1>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    room.isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {room.isAvailable ? "Available" : "Occupied"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-sm font-medium mb-1">
                Fixed Cost (per month)
              </div>
              <div className="text-2xl font-bold text-gray-900">
                Rp {room.fixedCost.toLocaleString("id-ID")}
              </div>
            </div>
            {rent && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 text-sm font-medium mb-1">
                  Current Rent Price
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  Rp{" "}
                  {(
                    rent.price +
                    (rent.additionals?.reduce(
                      (sum, add) => sum + add.price,
                      0
                    ) || 0)
                  ).toLocaleString("id-ID")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tenant Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Tenant Information
            </h2>
            {!rent ? (
              <AddTenantButton
                roomId={roomId}
                slug={slug}
                fixedCost={room.fixedCost}
                allAdditionals={allAdditionals}
              />
            ) : (
              rent.tenant && (
                <EditTenantButton
                  tenant={rent.tenant}
                  slug={slug}
                  roomId={roomId}
                />
              )
            )}
          </div>

          {!rent ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">
                No tenant assigned to this room yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rent.tenant && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Name</label>
                      <p className="font-semibold text-gray-900">
                        {rent.tenant.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-semibold text-gray-900">
                        {rent.tenant.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Phone Number
                      </label>
                      <p className="font-semibold text-gray-900">
                        {rent.tenant.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Birthday</label>
                      <p className="font-semibold text-gray-900">
                        {new Date(rent.tenant.birthday).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <p className="font-semibold">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            rent.tenant.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {rent.tenant.isActive ? "Active" : "Inactive"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Join Date</label>
                      <p className="font-semibold text-gray-900">
                        {new Date(rent.joinAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additionals Section */}
        {rent && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Additional Services
              </h2>
              <AddAdditionalButton
                rentId={rent._id}
                allAdditionals={allAdditionals}
                currentAdditionals={rent.additionals || []}
                slug={slug}
                roomId={roomId}
              />
            </div>

            {!rent.additionals || rent.additionals.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500">
                  No additional services added yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rent.additionals.map((additional) => (
                  <div
                    key={additional._id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {additional.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Rp {additional.price.toLocaleString("id-ID")} / month
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
