import authentication from "./authentication";
import { injectTransferTools } from "../utils";
import pcSupport from "./pcSupport";

authentication.downstreamAgents = [pcSupport];
const agents = injectTransferTools([authentication, pcSupport]);

export default agents;
