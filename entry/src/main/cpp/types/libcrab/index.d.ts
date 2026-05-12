export interface GadgetStatus {
  attempted: boolean;
  loaded: boolean;
  gadgetName: string;
  lastError: string;
}

export interface CrabBridge {
  bootstrap: (gadgetName?: string, config?: string) => GadgetStatus;
  status: () => GadgetStatus;
}

declare const crab: CrabBridge;

export default crab;
