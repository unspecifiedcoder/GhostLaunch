import { IDO__factory, ProjectToken__factory } from "../typechain-types";

// Your deployed contracts
export const IDO_ADDRESS = "0x3e4AcD0611a27a853559dAD34b2fBb8d2EBf57d1";
export const PROJECT_TOKEN_ADDRESS = "0x1e5ee02bfBFF110145881a50880BB671EbbDDE8A";

export function getIDOContract(signerOrProvider: any) {
  return IDO__factory.connect(IDO_ADDRESS, signerOrProvider);
}

export function getProjectTokenContract(signerOrProvider: any) {
  return ProjectToken__factory.connect(PROJECT_TOKEN_ADDRESS, signerOrProvider);
}
