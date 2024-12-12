import { create } from "zustand";

export enum ENVIRONMENT {
  LOCAL,
  MAINNET,
}
type EnvironmentState = {
  environment: ENVIRONMENT;
  setEnvironment: (env: ENVIRONMENT) => void;
};
const useEnvironment = create<EnvironmentState>((set) => ({
  environment: ENVIRONMENT.LOCAL,
  setEnvironment: (env: ENVIRONMENT) => set({ environment: env }),
}));

export default useEnvironment;
