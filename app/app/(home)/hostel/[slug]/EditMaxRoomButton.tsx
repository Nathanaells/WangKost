"use client";

import { useState } from "react";
import { updateHostelMaxRoom } from "./actions";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface EditMaxRoomButtonProps {
  slug: string;
  currentMaxRoom?: number;
}

export default function EditMaxRoomButton({
  slug,
  currentMaxRoom,
}: EditMaxRoomButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [maxRoom, setMaxRoom] = useState(currentMaxRoom?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const maxRoomNum = parseInt(maxRoom);
    if (isNaN(maxRoomNum) || maxRoomNum < 1) {
      toast.error("Please enter a valid number");
      return;
    }

    setIsLoading(true);
    const result = await updateHostelMaxRoom(slug, maxRoomNum);
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
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
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
          />
        </svg>
        Edit Max Room
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Edit Max Room
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="maxRoom"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Maximum Number of Rooms
                  </label>
                  <input
                    type="number"
                    id="maxRoom"
                    value={maxRoom}
                    onChange={(e) => setMaxRoom(e.target.value)}
                    className="text-gray-600 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter max room number"
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {currentMaxRoom || "Not set"}
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
