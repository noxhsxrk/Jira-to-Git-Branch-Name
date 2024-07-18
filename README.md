# Jira to Git Branch Name

This Visual Studio Code extension helps you create a Git branch name based on a Jira issue. It fetches the issue details from Jira using your saved credentials and generates a branch name with a predefined or user-specified prefix.

## Features

- Set up Jira credentials to authenticate with your Jira instance.
- Fetch Jira issue details and create a Git branch name.
- [NEW] Set a default prefix for the branch name.
- [NEW] Option to either copy the generated branch name to the clipboard or execute the git checkout -b command directly in the terminal.

## Prerequisites

Before using this extension, ensure you have the following:

- Jira domain (e.g., mycompany.atlassian.net)
- Jira user name (usually your email address)
- Jira API token (generate it in your Jira account settings)

## Installation

1. Open Visual Studio Code.
2. Go to Extensions (you can use the shortcut `Ctrl+Shift+X` or `Cmd+Shift+X`).
3. Search for "Jira to Git Branch Name".
4. Install the extension.

## Usage

### 1. Set up Jira Credentials

- Run the command: `Jira to Git Branch Name: Setup Jira Credentials`.
- Enter your Jira domain, user name, and API token when prompted.
- Credentials are saved globally for future use.

### 2. Fetch Jira Issue and Generate Git Branch Name

- Run the command: `Jira to Git Branch Name: Fetch Jira Issue`.
- Enter the Jira issue key or URL when prompted.
- Optionally, specify a prefix for the Git branch (e.g., feature, fix, hotfix).
- Choose whether to copy the generated branch name to the clipboard or execute the git checkout -b {branchName} command directly in the terminal.

### 3. Set Default Prefix

- Run the command: Jira to Git Branch Name: Set Default Prefix.
- Enter the default prefix you want to use for your Git branch names.
- This prefix will be used automatically if no prefix is specified when generating a branch name.

## Configuration

You can also configure Jira credentials directly in your VS Code settings:

```json
{
  "jiraToGitBranchName.jiraDomain": "your_jira_domain",
  "jiraToGitBranchName.userName": "your_jira_user_name",
  "jiraToGitBranchName.jiraApiToken": "your_jira_api_token",
  "jiraToGitBranchName.defaultPrefix": "your_default_prefix"
}
```
