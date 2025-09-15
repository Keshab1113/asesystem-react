import { Button } from "../../components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

function ContractorDeleteButton({ id, onDelete, handleCancel }) {
  const [loading, setLoading] = useState(false);

  const handleConfirmDelete = async () => {
    setLoading(true);
    await onDelete(id);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleCancel}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md mx-4 transform transition-all duration-300 ease-out">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Contractor
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <p className="text-gray-700 leading-relaxed">
              Are you sure you want to permanently remove this data from your
              records? This will delete all associated data and cannot be
              reversed.
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 order-1 sm:order-2 min-w-[80px]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Deleting...
                  </div>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ContractorDeleteButton;
