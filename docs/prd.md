# Awwab Product Requirements

## Vision
Awwab is a personal AI operating assistant that can understand commands, research information, manage productivity, work with software projects, synchronize relevant information across devices, and perform controlled actions through secure tools and automation.

## Principles
- Build incrementally.
- Treat mobile as a first-class client.
- Keep sensitive credentials and privileged execution server-side.
- Require explicit approval for sensitive actions.
- Maintain an understandable activity trail.
- Distinguish verified information from uncertainty.
- Never create activity merely for contribution metrics.

## Target clients
### Web/laptop
Text conversation, project management, research, automation configuration, approval review, activity history, settings, and developer workflows.

### Android
Text interaction, voice input, text-to-speech, notifications, personal workflows, and supported device actions subject to Android permissions and platform restrictions.

## Capability areas
- Productivity: tasks, notes, reminders, routines, goals and summaries
- Research: web research, documentation, comparisons and knowledge capture
- Software projects: repository inspection, status, research, approved implementation and documentation
- Voice/text interaction
- Controlled integrations and automation
- Persistent memory and activity history

## Security
Use authenticated identity, trusted-device/session controls, least-privilege permissions, audit logging and confirmation flows for sensitive actions. Voice recognition is not sufficient authorization for sensitive operations.

## Development phases
1. Foundation
2. Authentication and shared data
3. Basic assistant
4. Project intelligence
5. Voice and mobile experience
6. Integrations and automation
7. Advanced assistant

## First milestone
Establish architecture, documentation, security boundaries, data-model direction, development workflow and project tracking before implementing assistant features.
