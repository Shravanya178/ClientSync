import React, { useState } from "react";
import { addDummyProjects } from "../utils/addDummyProjects";

const DummyDataLoader = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddDummyProjects = async () => {
    setLoading(true);
    try {
      const result = await addDummyProjects();
      if (result) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-yellow-800">
            Development Helper
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            Add sample projects to test the dashboard functionality
          </p>
        </div>
        <button
          onClick={handleAddDummyProjects}
          disabled={loading || success}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            success
              ? "bg-green-600 text-white"
              : loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-yellow-600 text-white hover:bg-yellow-700"
          }`}
        >
          {loading ? "Adding..." : success ? "✅ Added!" : "Add Sample Projects"}
        </button>
      </div>
    </div>
  );
};

export default DummyDataLoader;
