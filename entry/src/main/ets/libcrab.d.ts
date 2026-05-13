declare module 'libcrab.so' {
  export interface Status {
    attempted: boolean;
    loaded: boolean;
    gadgetName: string;
    lastError: string;
  }

  const crab: {
    status: () => Status;
    bootstrap: (gadgetName?: string, config?: string) => Status
  }

  export default crab;

}