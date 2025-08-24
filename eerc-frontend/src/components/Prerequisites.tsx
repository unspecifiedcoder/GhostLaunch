// import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export const Prerequisites = () => (
    <div className="w-full max-w-3xl mt-6 p-4 border border-yellow-500/30 bg-yellow-500/10 text-yellow-200 rounded-lg" role="alert">
        <h3 className="font-bold flex items-center gap-2"><FaExclamationTriangle /> Important Prerequisites:</h3>
        <ol className="list-decimal list-inside mt-2 space-y-2 text-sm">
            <li>
                <strong>Deploy & Register:</strong> Use the scripts in the{' '}
                <a href="https://github.com/alejandro99so/eerc-backend-converter" target="_blank" rel="noopener noreferrer" className="underline text-yellow-300 hover:text-yellow-100">eerc-backend-converter</a>
                {' '}repo to deploy contracts and generate the Merkle proof (`proofs.json`).
            </li>
            <li>
                <strong>Transfer EERC:</strong> If applicable, transfer tokens to the VaultEOA via the{' '}
                <a href="https://www.3dent.xyz/?mode=converter" target="_blank" rel="noopener noreferrer" className="underline text-yellow-300 hover:text-yellow-100">3dent.xyz</a>
                {' '}converter.
            </li>
            <li>
                <strong>Use This UI:</strong> Once set up, use this dashboard to fund the IDO (as owner) or claim tokens (as a whitelisted participant).
            </li>
        </ol>
    </div>
);