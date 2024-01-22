import * as vscode from "vscode";
import axios, { AxiosError, isAxiosError } from "axios";

const jiraDomainKey = "jiraToGitBranchName.jiraDomain";
const userNameKey = "jiraToGitBranchName.userName";
const jiraApiTokenKey = "jiraToGitBranchName.jiraApiToken";

const getIssueTitle = (name: string) => {
  const symbolRegex = /[^\w\s]/gi;
  const title = name
    .replace(symbolRegex, " ")
    .trim()
    .split(" ")
    .filter((word) => word)
    .map((word) => word.toLowerCase())
    .join("-");
  return title;
};

const transformUrlToIssueId = (url: string) => {
  const issueIdRegex = /([A-Z][A-Z0-9]+-[0-9]+)/g;
  const issueId = url.match(issueIdRegex);
  return issueId?.length ? issueId[0] : "";
};
export function activate(context: vscode.ExtensionContext) {
  let setupCredentialsDisposable = vscode.commands.registerCommand(
    "jira-to-git-branch-name.setupJiraCredentials",
    async () => {
      const jiraDomainInConfig = vscode.workspace
        .getConfiguration()
        .get<string>(jiraDomainKey);
      const userNameInConfig = vscode.workspace
        .getConfiguration()
        .get<string>(userNameKey);
      const jiraApiTokenInConfig = vscode.workspace
        .getConfiguration()
        .get<string>(jiraApiTokenKey);

      const jiraDomain = await vscode.window.showInputBox({
        prompt: "Enter your Jira domain (e.g., mycompany.atlassian.net)",
        value: jiraDomainInConfig,
      });

      if (!jiraDomain) {
        vscode.window.showErrorMessage("Jira domain is required.");
        return;
      }

      const userName = await vscode.window.showInputBox({
        prompt: "Enter your Jira user name (e.g., your email address)",
        value: userNameInConfig,
      });

      if (!userName) {
        vscode.window.showErrorMessage("Jira user name is required.");
        return;
      }

      const jiraApiToken = await vscode.window.showInputBox({
        prompt: "Enter your Jira API token",
        password: true,
        value: jiraApiTokenInConfig,
      });

      if (!jiraApiToken) {
        vscode.window.showErrorMessage("Jira API token is required.");
        return;
      }

      vscode.workspace
        .getConfiguration()
        .update(jiraDomainKey, jiraDomain, vscode.ConfigurationTarget.Global);
      vscode.workspace
        .getConfiguration()
        .update(userNameKey, userName, vscode.ConfigurationTarget.Global);
      vscode.workspace
        .getConfiguration()
        .update(
          jiraApiTokenKey,
          jiraApiToken,
          vscode.ConfigurationTarget.Global
        );

      vscode.window.showInformationMessage(
        "Jira credentials saved successfully."
      );
    }
  );

  let fetchIssueDisposable = vscode.commands.registerCommand(
    "jira-to-git-branch-name.fetchJiraIssue",
    async () => {
      const jiraDomain = vscode.workspace
        .getConfiguration()
        .get<string>(jiraDomainKey);

      const userName = vscode.workspace
        .getConfiguration()
        .get<string>(userNameKey);

      const jiraApiToken = vscode.workspace
        .getConfiguration()
        .get<string>(jiraApiTokenKey);

      const defaultPrefix = "feature";

      if (!jiraDomain || !userName || !jiraApiToken) {
        vscode.window.showErrorMessage(
          "Jira credentials are not set up. Run 'Setup Jira Credentials' command first."
        );
        const choice = await vscode.window.showErrorMessage(
          "Jira credentials are not set up. Do you want to set them up now?",
          "Yes",
          "No"
        );

        if (choice === "Yes") {
          vscode.commands.executeCommand(
            "jira-to-git-branch-name.setupJiraCredentials"
          );
        }
        return;
      }

      const url = await vscode.window.showInputBox({
        prompt: "Enter the Jira issue key",
      });

      if (!url) {
        vscode.window.showErrorMessage("Jira URL is required.");
        return;
      }

      const key = transformUrlToIssueId(url);

      const jiraApiUrl = `https://${jiraDomain}/rest/api/3/issue/${key}`;
      const headers = {
        Authorization: `Basic ${Buffer.from(
          `${userName}:${jiraApiToken}`
        ).toString("base64")}`,
      };

      try {
        const response = await axios.get(jiraApiUrl, { headers });
        const issueData = response.data;

        const cardName = issueData.fields?.summary;

        if (cardName) {
          const name = getIssueTitle(cardName);

          const prefix = await vscode.window.showInputBox({
            prompt: "Enter the Prefix (eg. fix, hotfix, etc.) default: feature",
            value: defaultPrefix,
          });

          const branchName = `${prefix || defaultPrefix}/${key}-${name}`;

          vscode.env.clipboard.writeText(branchName).then(() => {
            vscode.window.showInformationMessage(
              `Copied branch name to clipboard:\n${branchName}`
            );
          });
        } else {
          vscode.window.showWarningMessage(
            "Card name not found in issue data."
          );
        }
      } catch (error) {
        if (isAxiosError(error)) {
          vscode.window.showErrorMessage(
            `Error fetching Jira issue: ${error.message}`
          );
        }
        return error;
      }
    }
  );

  context.subscriptions.push(setupCredentialsDisposable);
  context.subscriptions.push(fetchIssueDisposable);
}
