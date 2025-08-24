
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaSpinner } from 'react-icons/fa';

interface StatusDisplayProps {
  status: string;
}

export const StatusDisplay = ({ status }: StatusDisplayProps) => {
  if (!status) return null;

  const isError = status.startsWith("❌");
  const isSuccess = status.startsWith("✅");
  const isLoading = status.startsWith("⏳");

  let icon;
  let textColor = "text-gray-300";

  if (isError) {
    icon = <FaExclamationTriangle className="text-red-400" />;
    textColor = "text-red-400";
  } else if (isSuccess) {
    icon = <FaCheckCircle className="text-green-400" />;
    textColor = "text-green-400";
  } else if (isLoading) {
    icon = <FaSpinner className="animate-spin text-blue-400" />;
    textColor = "text-blue-400";
  } else {
    icon = <FaInfoCircle className="text-gray-400" />;
  }

  return (
    <div className={`mt-6 p-4 rounded-lg bg-gray-800 bg-opacity-70 border border-gray-700 flex items-center gap-4 ${textColor}`}>
      {icon}
      <p className="font-mono text-sm break-all">{status}</p>
    </div>
  );
};