import { AllAgentConfigsType } from "@/app/types";
// import frontDeskAuthentication from "./frontDeskAuthentication";
// import customerServiceRetail from "./customerServiceRetail";
// import simpleExample from "./simpleExample";
import pcSupport from "./pcSupport";

export const allAgentSets: AllAgentConfigsType = {
  pcSupport,
};

export const defaultAgentSetKey = "pcSupport";
