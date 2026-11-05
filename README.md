# Elsewhere

Elsewhere tests your project's getting-started guide on your community's own
machines, through their own locked-down agents in one Switch room.

Elsewhere is for project maintainers who want a small, reproducible test of
their onboarding instructions across volunteer environments, without giving
volunteers access to the maintainer's machine or write access to the source
repository.

A maintainer publishes a Python quickstart. Two volunteers try it on their own
machines: one on Python 3.9.6 gets a syntax error, while another on Python
3.12.15 succeeds. Their locked-down agents report the command and result in one
Switch room. The maintainer's agent checks the source through a read-only
GitHub connection, cites the relevant lines, and offers labelled fixes. The
maintainer human chooses one, and the volunteers rerun.

The recorded demo used three owner accounts on one Mac.

Docs: https://elsewhere-switch.vercel.app (mirror: https://cryptozephyr.github.io/elsewhere/)

## How it works

- A maintainer agent and a room are created from `templates/maintainer.yaml`.
  The room instructions and kickoff establish the test thread. The maintainer
  can read the selected GitHub repository and may address anyone in that room.
- Each volunteer deploys `templates/volunteer.yaml`. Its `repo` field tells
  the agent to clone this public repository into its work directory if needed.
  The setup command clones it before any session so the root `opencode.json`
  sets the volunteer's OpenCode restrictions.
- Cross-owner volunteers get a room-scoped addressing rule for the maintainer
  agent and its linked messaging identity. Solo volunteers use
  `owner-agents` addressing because both agents have the same owner.
- Volunteers report environment, command, expected result, and actual result.
  They don't speculate about causes. Volunteers send every result the
  maintainer needs, including step results, failure briefs, requested updates,
  and rerun results, with `send_targeted_message` in the kickoff thread, and
  also post each report in that thread. Before waiting on a volunteer, the
  maintainer checks the thread context once for a report that may already be
  posted. It reads the relevant source file through GitHub, groups results by
  environment, and proposes labelled options. It waits for a clear human
  choice before sending the approved fix instructions.

## Setup

Use a Switch server with managed agents and a messaging bridge. Each agent
owner needs a Switch account and OpenCode on the selected machine. The
maintainer's account needs a GitHub read connection scoped to the project
repository. Run these commands from a local clone of this public repository.

The script uses Gateway password login, which must be enabled on the server.
It reads the password from
`SWITCH_GATEWAY_PASSWORD` or prompts without echoing it, and keeps the
`switch_auth` cookie in memory. Set `SWITCH_GATEWAY_API` when the server is not
the local HTTPS default. For volunteers on other machines, set it to a
Gateway URL they can reach. The printed invite line includes that URL. Gateway
URLs must end in `/gateway`, and non-local URLs must use HTTPS. Set
`SWITCH_GATEWAY_EMAIL` to skip the email prompt. No password or cookie is
written to disk. For a private or self-signed Gateway, use `SWITCH_CA_FILE` or `--ca-file PATH` with a locally available CA certificate. Add `--dry-run` to any command to print its planned requests without calling the API or changing the workdirs.

### Solo (one person, about 5 minutes)

Run one command from the repository root:

```sh
scripts/elsewhere solo --project my-project --repo OWNER/NAME
```

The command creates a maintainer and one volunteer owned by the same account,
places the maintainer config, clones this repository into the volunteer
workdir, checks both effective OpenCode configs, and confirms that neither
agent has an OpenCode session. The volunteer uses `owner-agents` addressing,
so no addressing-policy update is needed. Paste the printed request message
into the room's kickoff thread. It mentions both agents.
Pass `--machine NAME` to place both agents on a specific controller.

For the bundled example, the result depends on the judge's Python version.
macOS system Python 3.9.6 fails at the pattern-matching step. Python 3.10 or
newer passes it.

### Real setup (maintainer plus volunteers on their own machines)

The maintainer runs one command:

```sh
scripts/elsewhere maintainer --project my-project --repo OWNER/NAME
```

The command deploys the maintainer and room, places the separate
`maintainer/opencode.json` in the empty maintainer workdir, checks its
effective permissions, and confirms there is no OpenCode session. It prints
the room name, an invite line, and a request message to paste into the kickoff
thread after volunteers are ready. The kickoff itself is neutral, so no agent
starts before its config is in place. If the account has multiple linked
messaging identities, the command asks which one is used by the room. The
invite line includes the Gateway URL volunteers need.

Each volunteer uses one command on their own machine, with a unique lowercase
handle:

```sh
scripts/elsewhere volunteer --join JOIN_CODE --handle volunteer-1
```

The command deploys the volunteer into the room, clones this public repository
into the empty workdir, checks the effective OpenCode permissions and zero
sessions, then adds only the maintainer agent and its linked messaging
identity to the volunteer's addressing policy for that room. The join code
contains only the project slug and Switch IDs. It is setup data, not an access
credential. Volunteers must sign in to an account that can access the room.
Mention the maintainer in the kickoff request and in every later clarification
or approval. Keep the full exchange in that thread.

The maintainer command defaults to `opencode/big-pickle`; use `--model` to
select another model. Use `--machine` to select a controller by name.
Volunteers can also use `--machine`. The maintainer's workdir is kept separate
from the project checkout and must contain only `opencode.json`.

OpenCode reads the root `opencode.json` from the agent's workdir, including
when a session runs from `sample/`. The script checks the effective
permissions with `opencode debug config --pure` and verifies there is no
session before it prints `ready`. It never posts messages or starts sessions.

## Safety and limits

Volunteers have a Bash deny rule with only the patterns `mkdir *`, `cd *`,
`python3 *`, `cat *`, `ls`, `pwd`, `python3 --version`, and `git clone *`
allowed. OpenCode edits are limited to the agent's work directory;
external-directory access and web fetching are denied. The maintainer config
denies all OpenCode tools by default, then allows `switch_*` and a narrow Bash
rule for `gh api repos/*`.
The maintainer may read files only with the default-GET command
`gh api repos/{project_repo}/contents/<path> -H "Accept: application/vnd.github.raw"`.
It numbers the returned lines itself and cites `path:line`. It runs no other
commands and never starts subagents or tasks. Switch's `gh` wrapper asks for a
GitHub App installation token and passes it to `gh`; the server scopes that
token to the maintainer's read grant for the selected repository. The session
does not inherit the controller's `GH_TOKEN` or `GITHUB_TOKEN`. If the Switch
token cannot be issued, the local wrapper can fall back to machine GitHub
credentials. Stop if the wrapper reports that fallback. Keep auto-approval
disabled.

The templates and restrictions are guardrails, not a sandbox for hostile code.
The volunteer agent can read and edit files in its work directory, and every
allowed Python command can execute arbitrary Python code. Review the quickstart
before inviting volunteers, use a fresh work directory, and don't grant
volunteers write access to project services.

`opencode/big-pickle` is a free model option. Model availability and limits can
change. Each volunteer supplies their own machine and agent installation.
Elsewhere does not guarantee that a model will respond, that every platform
delivers messages in the same way, or that a quickstart result generalizes
beyond the environments tested. No agent may write to the project repository;
the maintainer human applies any approved source change separately.
