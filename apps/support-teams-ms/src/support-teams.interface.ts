import { Solicitation } from "apps/solicitation-queue-ms/src/solicitation-queue.interfaces";

export interface Support {
    id: number;
    name: string;
    processingSolicitations: Array<Solicitation>
}