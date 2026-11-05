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

## How it works

- A maintainer agent and a room are created from `templates/maintainer.yaml`.
  The room instructions and kickoff establish the test thread. The maintainer
  can read the selected GitHub repository and may address anyone in that room.
- Each volunteer deploys `templates/volunteer.yaml`. Its `repo` field tells
  the agent to clone this public repository into its work directory if needed,
  and the root `opencode.json` sets its OpenCode restrictions.
- The maintainer human adds each volunteer's agent and linked messaging
  identity to the room-scoped addressing policy. The template cannot name
  particular people or agents in a room created by a different run, so this
  step is required.
- Volunteers report environment, command, expected result, and actual result.
  They don't speculate about causes. The maintainer waits for every volunteer,
  reads the relevant source file through GitHub, groups results by environment,
  and proposes labelled options. It waits for a clear human choice before
  sending the approved fix instructions.

## Setup

Use Switch's standard Docker deployment for the server and Switch Console to
connect the messaging workspace and manage agent machines. The server must
support managed agents. Set up OpenCode on each machine. Connect the maintainer
account's GitHub access with read-only access to the project repository only.

1. Run templates through the Gateway template-document endpoint,
   `POST /gateway/rooms/from-template-document`, as the person who owns each
   agent. Import `templates/maintainer.yaml` and deploy it as the project
   maintainer. Set the project slug and GitHub `owner/name` repository, choose
   a machine, and keep the model at `opencode/big-pickle` or select another
   free model. The request has the template YAML in `template`, parameter
   values in `inputs`, and a label in `template_name`.
2. Before any maintainer session starts, clone this public repository into
   a separate local directory and copy only `maintainer/opencode.json` to the
   root of the maintainer's working directory. Do not put the project checkout
   in the maintainer's working directory. The maintainer template has no `repo`
   field, so deployment does not populate its work directory.
3. Invite volunteer humans to the room. Each volunteer imports and deploys
   `templates/volunteer.yaml` through the same endpoint, choosing the room
   created in step 1, their own machine, the project slug, and a unique
   lowercase `volunteer` handle such as `volunteer-1`.
4. Before any volunteer session starts, clone this public repository into
   each volunteer's empty working directory. The template `repo` field adds
   an instruction for the agent to clone the repository at session start if
   needed, but deployment itself does not populate the directory. Cloning it
   beforehand makes the root `opencode.json` available when OpenCode starts.
5. For each volunteer agent, run `scripts/allow-maintainer` once as that
   volunteer's owner. Provide the Gateway API base URL, a short-lived
   `switch_auth` session cookie value, the volunteer agent ID, room ID,
   maintainer agent ID, and the maintainer's linked messaging identity ID as
   environment variables. `MAINTAINER_USER_ID` is the linked identity's `id`
   field from `/auth/me/identities`. Don't use its `external_user_id` field or
   the Switch user's ID. The script reads the
   volunteer's current policy, preserves its owner rule, and adds only the
   named maintainer agent and human in the selected room. The variable names
   are `SWITCH_GATEWAY_API`, `SWITCH_AUTH_COOKIE`, `VOLUNTEER_AGENT_ID`,
   `ROOM_ID`, `MAINTAINER_AGENT_ID`, and `MAINTAINER_USER_ID`.
   `SWITCH_GATEWAY_API` ends in `/gateway`.
6. Before posting, confirm that no session exists yet for any of the agents.
   From each actual work directory, run `opencode debug config` and verify
   the effective permissions. The maintainer config is copied from
   `maintainer/opencode.json`; volunteer configs come from the repository
   root.
7. Reply in the template kickoff thread with the quickstart request and
   mention the maintainer agent to start it. Keep the full exchange in that
   thread. The maintainer waits for all volunteers, reports the evidence and
   source citations, then waits for a human to approve a labelled option.

OpenCode reads the root `opencode.json` from the agent's working directory,
including when a session runs from `sample/`. The maintainer uses the separate
config in `maintainer/`, copied to the root of its work directory as described
above. The maintainer work directory should contain only that config. Verify
the effective settings from each agent's working directory before posting.

## Safety and limits

Volunteers have a Bash deny rule with only `mkdir`, `cd`, `python3`, `cat`,
`ls`, `pwd`, `git clone`, and `python3 --version` allowed. OpenCode edits are
limited to the agent's work directory; external-directory access and web
fetching are denied. The maintainer has local file tools, Bash, edit,
external-directory, and web access denied. It gets only a read-only GitHub
connection. Keep auto-approval disabled.

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
