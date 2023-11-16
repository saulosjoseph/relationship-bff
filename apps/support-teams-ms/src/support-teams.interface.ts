import { Solicitation } from "apps/solicitation-queue-ms/src/solicitation-queue.interfaces";

export interface Support {
    id: string;
    name: string;
    processingSolicitations: Array<Solicitation>
}

export interface CloseSolicitation {
    support: string;
    type: string;
    solicitation: string;
}