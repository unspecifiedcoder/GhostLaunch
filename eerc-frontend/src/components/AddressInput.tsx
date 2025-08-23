import React from "react";

interface Props {
  label: string;
  value: string;
  setValue: (val: string) => void;
  isValid: boolean;
}

export const AddressInput: React.FC<Props> = ({ label, value, setValue, isValid }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="0x..."
      className="w-full p-2 border rounded"
    />
    {!isValid && value.length > 0 && (
      <p className="text-red-500 text-sm mt-1">❌ Invalid address</p>
    )}
  </div>
);
