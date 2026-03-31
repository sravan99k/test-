import { friendshipScenarios } from "./friendship";
import { familyScenarios } from "./family";
import { schoolScenarios } from "./school";
import { onlineScenarios } from "./online";
import { communityScenarios } from "./community";

export const empathyScenarios = [
  ...friendshipScenarios,
  ...familyScenarios,
  ...schoolScenarios,
  ...onlineScenarios,
  ...communityScenarios,
];

// Export scenarios by category for session-based selection
export const scenariosByCategory = {
  friendship: friendshipScenarios,
  family: familyScenarios,
  school: schoolScenarios,
  online: onlineScenarios,
  community: communityScenarios,
};

export * from './types';
