# Security policy

## Reporting a vulnerability

Please do not open a public issue for a vulnerability. Report it in private with the private vulnerability reporting of GitHub: on the page of the repository, open the Security tab and choose "Report a vulnerability" (<https://github.com/thiagopedro99/enchase/security/advisories/new>).

If that page is not available, open a public issue that only asks for a private channel, and leave out everything about the vulnerability. The maintainer will answer with one.

A report helps when it has the version of `enchase`, how to reproduce the problem (a small app is best) and what an attacker gets out of it.

## What to expect

- A first answer within seven days.
- A fix released as a patch of the latest minor version, with a note in the release.
- The advisory is published after the fix, and the reporter is credited unless they prefer not to be.

## Supported versions

Only the latest minor version gets fixes, as [VERSIONING.md](VERSIONING.md) says. While the project is 0.x, that is the latest `0.x` release.

## Scope

In scope: the published package `enchase`, the `enchase` command (`enchase eject`) and the files that it copies into a project, for example a way to run a script through the inline script of `ColorModeScript` or through the CSS that the theme writes.

Out of scope: the demo, the Storybook, the development dependencies of the repository, and what an app does with the library, such as HTML that the app itself does not sanitize.
