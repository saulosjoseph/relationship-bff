import { NewSolicitation } from "apps/relationship-bff/src/app.validator";

export interface Solicitation extends NewSolicitation {
    id: string;
}