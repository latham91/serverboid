import chalk from "chalk";

import watchChatLog from "../../watchers/chat.js";
import watchPerkLog from "../../watchers/perk.js";
import watchAdminLog from "../../watchers/admin.js";

export default (client) => {
  console.log(`${client.user.tag} is online!`);
  console.log(chalk.yellow("Waiting for server to create missing log files..."));

  // watchChatLog(client);
  // watchPerkLog(client);
  // watchAdminLog(client);
};
