# Claude Studio Mods

Small, tested mods for Claude Code. Each one does one job, asks for the least access it can, and says exactly what it touches.

Mods need Claude Code 2.1.287 or later. They run in the terminal and in the Claude desktop app's Code tab.

## Install

Type the line at the prompt of a terminal Claude Code session, answer `y` to add the marketplace, then pick a scope:

```text
/plugin install secret-guard --marketplace Sajid-Rahman0126/claude-studio-mods
```

Swap `secret-guard` for `touched-files` or `kanban-status` to install the others.

## The mods

### secret-guard
Blocks Claude's Read, Edit and Write tools, and shell commands, from touching files that usually hold secrets: `.env` and `.env.*`, `*.pem` / `*.key` / `*.p12`, SSH private keys, `~/.aws/credentials`, `.npmrc`, `.netrc`, `.pypirc`, Docker and GitHub CLI auth files, and `*credentials*.json` / `*service-account*.json`. Template files such as `.env.example` stay allowed. Symlinks are followed, so a harmless-looking link to a key is still blocked. When it blocks something, Claude is told why, and you see a short notice.

- **Access it uses:** checks the path of each Read, Edit, Write and Bash call, and looks up where a path really points. It never reads file contents and never uses the network.
- **Limits:** this is a deny-list, so it is best effort. Hard links, copies under a new name, or a script that builds the path at run time can get past it. Treat it as a seatbelt, not a vault.

### touched-files
Keeps a list of every file Claude edited or wrote in this session. The status line shows a count, and `/touched` opens a pane with each file and how many times it changed.

- **Access it uses:** watches Edit, Write and NotebookEdit calls after they finish, and reads the time. It reads no files and never uses the network.

### kanban-status
Shows an [Obsidian Kanban](https://github.com/mgmeyers/obsidian-kanban) board in the status line, such as `Board · Todo 3 · Doing 1`. `/board` opens a pane with every open card. Works with any Markdown file that uses `## Column` headings and `- [ ]` cards.

- **Access it uses:** reads one file, `BOARD.md` in the session folder by default. Change it with the **Board file** option in the plugin's settings. It writes nothing and never uses the network.

## Safety

Mods run with your permissions and are not sandboxed. Read the code before installing any mod, these included; each one is a few dozen lines in `mods/<name>/hooks/`. To start Claude Code with no mods loaded, run `claude --safe-mode`.

## Development

Each mod has tests. From a mod's folder:

```bash
claude plugin validate .
```

```bash
claude plugin test .
```

## License

MIT
