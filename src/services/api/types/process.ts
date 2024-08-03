export enum ProcessType {
  Internal = "internal",
  External = "external",
}

export type Process = {
  id: number;
  name: string;
  file: string;
  type: ProcessType;
};
