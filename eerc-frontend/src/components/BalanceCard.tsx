interface Props {
  walletBalance: string;
  idoBalance: string;
}

export const BalanceCard: React.FC<Props> = ({ walletBalance, idoBalance }) => (
  <div className="mt-6 p-4 border rounded-lg bg-gray-100">
    <h2 className="text-lg font-semibold">Balances</h2>
    <p>💳 Wallet Balance: {walletBalance} Tokens</p>
    <p>🏦 IDO Balance: {idoBalance} Tokens</p>
  </div>
);
