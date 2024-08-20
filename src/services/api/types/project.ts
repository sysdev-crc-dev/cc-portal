import { Customer } from "./customer";
import { Employee } from "./employee";
import { Material } from "./material";
import { Process } from "./process";
import { Supply } from "./supply";

export interface Project {
  id?: number;
  name: string;
  file: string;
  est_dimensions: string;
  completion_date?: Date;
  est_cutting_time_in_hours: number;
  est_man_hours: number;
  material_provided_by: ProjectMaterialProvidedBy;
  started_date?: Date;
  delivery_type: ProjectDeliveryType;
  package_type: ProjectPackageType;
  assigned_machine: ProjectMachineType | null;
  estimated_delivery_date: string;
  actual_cutting_time: number;
  status: ProjectStatus;
  customer_id: number;
  customer?: Customer;

  // instalator?: Instalor;
  employee_in_charge_id: number;
  employee_in_charge?: Employee;
  operator_id: number;
  operator?: Employee;
  supplies?: Supply[];
  materials?: Material[];
  processes?: Process[];

  cutting_note?: string;
  in_processing_note?: string;
  quality_assurance_note?: string;
  waiting_materials_note?: string;
  cancel_reason?: string;
  cancelation_date?: Date;
}

export enum ProjectStatus {
  Created = "created",
  Started = "started",
  ReadyForCutting = "ready_for_cutting",
  InProgress = "in_progress",
  QA = "qa",
  ReadyForDelivery = "ready_for_delivery",
  Completed = "completed",
  Canceled = "canceled",
  WaitingForMaterial = "waiting_for_material",
  ExternalDependency = "external_dependency",
}

export enum ProjectDeliveryType {
  Home = "home",
  Workshop = "workshop",
  Instalation = "instalation",
}
export enum ProjectMaterialProvidedBy {
  Cometa = "cometa",
  Customer = "customer",
}
export enum ProjectPackageType {
  Basic = "basic",
  Custom = "custom",
}

export enum ProjectMachineType {
  Red = "red",
  White = "white",
  Fiber = "fiber",
}
