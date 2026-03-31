import { grade6Configs } from "./grade6";
import { grade7Configs } from "./grade7";
import { grade8Configs } from "./grade8";
import { grade9Configs } from "./grade9";
import { grade10Configs } from "./grade10";
import { GradePhaseConfig } from "../types";

export const FLOW_CONFIG: Record<string, GradePhaseConfig> = {
    ...grade6Configs,
    ...grade7Configs,
    ...grade8Configs,
    ...grade9Configs,
    ...grade10Configs,
};
