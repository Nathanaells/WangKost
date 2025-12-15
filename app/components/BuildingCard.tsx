"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import url from "./constant";

interface IBuilding {
  id?: string;
  name: string;
  totalRooms: number;
  occupancy: number;
}

export default function BuildingCard(props: IBuilding) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!props.id) return;

    const confirmed = confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`${url}/api/hostels/${props.id}`, {
        method: "DELETE",
        // ! Tambahin Cookies
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete hostel");
      }

      toast.success("Hostel deleted successfully!");
      router.refresh();
    } catch (error: unknown) {
      toast.error((error as string) || "Failed to delete hostel");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => {
        if (props.id) {
          router.push(`/hostel/${props.id}`);
        }
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-blue-50`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-6 h-6 text-blue-600`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{props.name}</h3>
        </div>
        <div className="flex gap-2">
          <button
            className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
            onClick={handleDelete}
            disabled={deleting}
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
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-gray-500 text-sm mb-1">Total Rooms</div>
          <div className="text-gray-900 font-semibold">{props.totalRooms}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm mb-1">Occupancy</div>
          <div className="text-gray-900 font-semibold">{props.occupancy}%</div>
        </div>
      </div>
    </div>
  );
}
