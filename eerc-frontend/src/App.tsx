import { useAccount, useWalletClient } from "wagmi";
import { useState, useCallback } from "react"; // Import useCallback
import { ethers } from "ethers";
import { IDO__factory, ProjectToken__factory } from "./typechain-types";
import proofs from "./proofs.json";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaCoins, FaGift, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaSpinner } from 'react-icons/fa';

// Particle background imports
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

// --- Helper Components ---

const StyledInput = ({ value, onChange, placeholder, type = "text" }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, type?: string }) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors w-full"
    />
);

const ActionButton = ({ onClick, children, disabled = false }: { onClick: () => void, children: React.ReactNode, disabled?: boolean }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
    >
        {children}
    </button>
);

const Card = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-black bg-opacity-30 border border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-200">{title}</h2>
        {children}
    </div>
);

const StatusDisplay = ({ status }: { status: string }) => {
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


// --- Main App Component ---
export default function App() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();

    const [status, setStatus] = useState("");
    const [amount, setAmount] = useState("");
    const [idoAddress, setIdoAddress] = useState("");
    const [tokenAddress, setTokenAddress] = useState("");

    // --- Particle Background Setup ---
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    const particleOptions = {
        background: {
            color: {
                value: '#0d1117',
            },
        },
        fullScreen: {
            enable: true,
            zIndex: -1,
        },
        fpsLimit: 60,
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: "repulse",
                },
                resize: true,
            },
            modes: {
                repulse: {
                    distance: 100,
                    duration: 0.4,
                },
            },
        },
        particles: {
            color: {
                value: ["#ff00ff", "#9c27b0", "#00d5ff", "#ffffff"],
            },
            links: {
                enable: false,
            },
            move: {
                direction: "none",
                enable: true,
                outModes: {
                    default: "out",
                },
                random: true,
                speed: 1,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                    area: 800,
                },
                value: 40,
            },
            opacity: {
                value: { min: 0.4, max: 0.9 },
            },
            shape: {
                type: "char",
                character: {
                    value: ["✨", "✦", "✧", "⭐"],
                    font: "Verdana",
                    style: "",
                    weight: "400",
                    fill: true,
                },
            },
            size: {
                value: { min: 8, max: 16 },
            },
        },
        detectRetina: true,
    };

    const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);
    const areContractsValid = isValidAddress(idoAddress) && isValidAddress(tokenAddress);

    async function getSigner() {
        if (!walletClient) throw new Error("No wallet connected");
        const provider = new ethers.BrowserProvider(walletClient.transport);
        return await provider.getSigner();
    }

    const getIDOContract = (signer: any) => IDO__factory.connect(idoAddress, signer);
    const getTokenContract = (signer: any) => ProjectToken__factory.connect(tokenAddress, signer);

    async function fundIDO() {
        if (!areContractsValid || !amount) {
            setStatus("❌ Error: Please provide valid contract addresses and an amount.");
            return;
        }
        try {
            setStatus("⏳ Approving token spend...");
            const signer = await getSigner();
            const ido = getIDOContract(signer);
            const token = getTokenContract(signer);
            const amt = ethers.parseEther(amount);
            const tx1 = await token.approve(await ido.getAddress(), amt);
            await tx1.wait();
            setStatus("⏳ Funding IDO with project tokens...");
            const tx2 = await ido.depositProjectTokens(amt);
            await tx2.wait();
            setStatus(`✅ Funded IDO with ${amount} tokens`);
            setAmount("");
        } catch (e: any) {
            const message = e.reason || e.message;
            setStatus(`❌ Error: ${message}`);
        }
    }

    async function claimTokens() {
        if (!areContractsValid) {
            setStatus("❌ Error: Please provide valid contract addresses.");
            return;
        }
        try {
            if (!address) throw new Error("Wallet not connected");
            setStatus("⏳ Preparing claim...");
            const proofData = (proofs as any)[address];
            if (!proofData) throw new Error("No Merkle proof found for this address!");
            const signer = await getSigner();
            const ido = getIDOContract(signer);
            const token = getTokenContract(signer);
            const balanceBefore = await token.balanceOf(address);
            setStatus("⏳ Processing claim on-chain...");
            const tx = await ido.claim(address, proofData.allocationWei, proofData.proof);
            await tx.wait();
            const balanceAfter = await token.balanceOf(address);
            const claimedAmount = ethers.formatEther(balanceAfter - balanceBefore);
            setStatus(`✅ Claim successful! You received ${claimedAmount} tokens.`);
        } catch (e: any) {
            const message = e.reason || e.message;
            setStatus(`❌ Error: ${message}`);
        }
    }

    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center font-mono p-4">
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={particleOptions as any}
            />

            <div className="relative z-10 w-full flex flex-col items-center">
                <main className="w-full max-w-3xl bg-black bg-opacity-40 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl shadow-blue-500/10">
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                        <h1 className="text-2xl font-bold">🔐 Merkle Drop IDO</h1>
                        <ConnectButton />
                    </div>
                    <div className="p-6">
                        {isConnected ? (
                            <>
                                <p className="text-center text-gray-400 mb-6">Connected as: <span className="font-bold text-indigo-400 break-all">{address}</span></p>
                                <Card title="1. Contract Setup">
                                    <div className="space-y-4">
                                        <StyledInput value={idoAddress} onChange={(e) => setIdoAddress(e.target.value)} placeholder="IDO Contract Address (0x...)" />
                                        <StyledInput value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="ProjectToken Address (0x...)" />
                                    </div>
                                </Card>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card title="2. Fund (Owner)">
                                        <div className="flex flex-col gap-4">
                                            <StyledInput value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount to fund" type="number" />
                                            <ActionButton onClick={fundIDO} disabled={!areContractsValid || !amount}>
                                                <FaCoins /> Fund IDO
                                            </ActionButton>
                                        </div>
                                    </Card>
                                    <Card title="3. Claim (Participant)">
                                        <div className="flex flex-col h-full justify-center">
                                            <ActionButton onClick={claimTokens} disabled={!areContractsValid}>
                                                <FaGift /> Claim My Tokens
                                            </ActionButton>
                                        </div>
                                    </Card>
                                </div>
                                <StatusDisplay status={status} />
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <h2 className="text-2xl font-bold text-gray-300">Welcome to the IDO Dashboard</h2>
                                <p className="mt-2 text-gray-400">Please connect your wallet to continue.</p>
                            </div>
                        )}
                    </div>
                </main>
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
            </div>
        </div>
    );
}