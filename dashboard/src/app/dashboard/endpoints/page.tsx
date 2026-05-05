"use client";

import { useState } from "react";

export default function EndpointsPage() {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Endpoints</h1>
      </div>

      {/* Create Endpoint Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Endpoint</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: API call
            alert(`Endpoint created: ${url}`);
          }}
          className="flex gap-4 items-end"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://myapp.com/webhook"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Order notifications"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition whitespace-nowrap"
          >
            + Add
          </button>
        </form>
      </div>

      {/* Endpoints List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Endpoints</h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          <p>No endpoints yet. Add one above to get started.</p>
        </div>
      </div>
    </div>
  );
}
