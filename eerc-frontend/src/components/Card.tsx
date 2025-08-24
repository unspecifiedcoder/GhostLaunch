import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card = ({ title, children }: CardProps) => (
  <div className="bg-black bg-opacity-30 border border-gray-700 rounded-xl p-6 mb-6">
    <h2 className="text-xl font-bold mb-4 text-gray-200">{title}</h2>
    {children}
  </div>
);