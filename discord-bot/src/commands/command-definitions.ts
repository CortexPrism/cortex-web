export const commandDefinitions = [
  { name: "stats", description: "Show marketplace statistics" },
  {
    name: "plugin", description: "Search or view plugin details",
    options: [
      { name: "action", description: "search or info", type: 3, required: true, choices: [{ name: "search", value: "search" }, { name: "info", value: "info" }] },
      { name: "query", description: "Search query or plugin name/ID", type: 3, required: true },
    ],
  },
  {
    name: "agent", description: "Search or view agent details",
    options: [
      { name: "action", description: "search or info", type: 3, required: true, choices: [{ name: "search", value: "search" }, { name: "info", value: "info" }] },
      { name: "query", description: "Search query or agent name/ID", type: 3, required: true },
    ],
  },
  {
    name: "review", description: "Admin review commands",
    options: [
      { name: "action", description: "list, approve, or reject", type: 3, required: true, choices: [{ name: "list", value: "list" }, { name: "approve", value: "approve" }, { name: "reject", value: "reject" }] },
      { name: "id", description: "Submission ID", type: 3, required: false },
      { name: "reason", description: "Rejection reason", type: 3, required: false },
    ],
  },
  { name: "warn", description: "Warn a user", options: [{ name: "user", description: "User to warn", type: 6, required: true }, { name: "reason", description: "Reason", type: 3, required: false }] },
  { name: "mute", description: "Timeout a user", options: [{ name: "user", description: "User to mute", type: 6, required: true }, { name: "duration", description: "Duration (e.g. 10m, 2h)", type: 3, required: false }, { name: "reason", description: "Reason", type: 3, required: false }] },
  { name: "unmute", description: "Remove timeout", options: [{ name: "user", description: "User to unmute", type: 6, required: true }, { name: "reason", description: "Reason", type: 3, required: false }] },
  { name: "kick", description: "Kick a user", options: [{ name: "user", description: "User to kick", type: 6, required: true }, { name: "reason", description: "Reason", type: 3, required: false }] },
  { name: "ban", description: "Ban a user", options: [{ name: "user", description: "User to ban", type: 6, required: true }, { name: "reason", description: "Reason", type: 3, required: false }, { name: "days", description: "Days of messages to delete (0-7)", type: 4, required: false }] },
  { name: "unban", description: "Unban a user by ID", options: [{ name: "user_id", description: "User ID to unban", type: 3, required: true }, { name: "reason", description: "Reason", type: 3, required: false }] },
  { name: "purge", description: "Bulk delete messages", options: [{ name: "count", description: "Messages to delete (1-100)", type: 4, required: true }, { name: "user", description: "Filter by user", type: 6, required: false }] },
  {
    name: "modlogs", description: "View moderation logs",
    options: [
      { name: "user", description: "Filter by user", type: 6, required: false },
      { name: "action", description: "Filter by action", type: 3, required: false, choices: [
        { name: "Warn", value: "warn" }, { name: "Mute", value: "mute" }, { name: "Unmute", value: "unmute" },
        { name: "Kick", value: "kick" }, { name: "Ban", value: "ban" }, { name: "Unban", value: "unban" }, { name: "Purge", value: "purge" },
      ]},
    ],
  },
  {
    name: "guild", description: "Server information and settings",
    options: [
      { name: "info", description: "View server information", type: 1 },
      { name: "settings", description: "View or modify guild settings", type: 1, options: [
        { name: "action", description: "view or set", type: 3, required: true, choices: [{ name: "view", value: "view" }, { name: "set", value: "set" }] },
        { name: "key", description: "Setting to change", type: 3, required: false, choices: [
          { name: "Log Channel", value: "log_channel" }, { name: "Mod Role", value: "mod_role" }, { name: "Admin Role", value: "admin_role" },
          { name: "Max Warns", value: "max_warns" }, { name: "Default Slowmode", value: "slowmode" },
          { name: "Auto Mod", value: "auto_mod" }, { name: "Welcome", value: "welcome" }, { name: "Leave", value: "leave" },
        ]},
        { name: "value", description: "New value", type: 3, required: false },
      ]},
    ],
  },
  { name: "user", description: "View user information", options: [{ name: "user", description: "User to view", type: 6, required: false }] },
  { name: "slowmode", description: "Set channel slowmode", options: [{ name: "duration", description: "Slowmode (e.g. 30s, 5m, 0 to disable)", type: 3, required: false }, { name: "channel", description: "Target channel", type: 7, required: false }] },
  { name: "nickname", description: "Change a user's nickname", options: [{ name: "user", description: "User", type: 6, required: true }, { name: "name", description: "New nickname (empty to reset)", type: 3, required: false }, { name: "reason", description: "Reason", type: 3, required: false }] },
  { name: "lockdown", description: "Lock a channel", options: [{ name: "channel", description: "Channel to lock", type: 7, required: false }, { name: "reason", description: "Reason", type: 3, required: false }] },
  { name: "unlock", description: "Unlock a channel", options: [{ name: "channel", description: "Channel to unlock", type: 7, required: false }] },
  {
    name: "role", description: "Manage roles",
    options: [
      { name: "create", description: "Create a role", type: 1, options: [
        { name: "name", description: "Role name", type: 3, required: true },
        { name: "color", description: "Role color", type: 3, required: false, choices: ["Red","Orange","Yellow","Green","Blue","Purple","Pink","Teal","White","Black","Grey","Default"].map(c => ({ name: c, value: c })) },
        { name: "hoist", description: "Show separately", type: 5, required: false },
        { name: "mentionable", description: "Allow mentions", type: 5, required: false },
      ]},
      { name: "delete", description: "Delete a role", type: 1, options: [{ name: "role", description: "Role to delete", type: 8, required: true }] },
      { name: "edit", description: "Edit a role", type: 1, options: [
        { name: "role", description: "Role to edit", type: 8, required: true },
        { name: "name", description: "New name", type: 3, required: false },
        { name: "color", description: "New color", type: 3, required: false, choices: ["Red","Orange","Yellow","Green","Blue","Purple","Pink","Teal","White","Black","Grey","Default"].map(c => ({ name: c, value: c })) },
        { name: "hoist", description: "Show separately", type: 5, required: false },
        { name: "mentionable", description: "Allow mentions", type: 5, required: false },
      ]},
      { name: "assign", description: "Toggle role on user", type: 1, options: [{ name: "user", description: "User", type: 6, required: true }, { name: "role", description: "Role", type: 8, required: true }] },
      { name: "list", description: "List all roles", type: 1 },
      { name: "info", description: "Role details", type: 1, options: [{ name: "role", description: "Role", type: 8, required: true }] },
      { name: "mass", description: "Mass assign/remove role", type: 1, options: [
        { name: "role", description: "Role", type: 8, required: true },
        { name: "action", description: "Add or remove", type: 3, required: true, choices: [{ name: "add", value: "add" }, { name: "remove", value: "remove" }] },
      ]},
    ],
  },
  {
    name: "channel", description: "Manage channels",
    options: [
      { name: "create", description: "Create a channel", type: 1, options: [
        { name: "name", description: "Channel name", type: 3, required: true },
        { name: "type", description: "Channel type", type: 3, required: false, choices: [{ name: "text", value: "text" }, { name: "voice", value: "voice" }, { name: "announcement", value: "announcement" }, { name: "forum", value: "forum" }, { name: "stage", value: "stage" }] },
        { name: "category", description: "Parent category", type: 7, required: false },
      ]},
      { name: "delete", description: "Delete a channel", type: 1, options: [{ name: "channel", description: "Channel to delete", type: 7, required: true }] },
      { name: "edit", description: "Edit a channel", type: 1, options: [
        { name: "channel", description: "Channel to edit", type: 7, required: true },
        { name: "name", description: "New name", type: 3, required: false },
        { name: "topic", description: "New topic", type: 3, required: false },
        { name: "nsfw", description: "Age-restricted", type: 5, required: false },
        { name: "slowmode", description: "Slowmode in seconds", type: 4, required: false },
        { name: "category", description: "New category", type: 7, required: false },
      ]},
      { name: "info", description: "Channel details", type: 1, options: [{ name: "channel", description: "Channel", type: 7, required: true }] },
      { name: "list", description: "List all channels", type: 1 },
    ],
  },
  {
    name: "reactionrole", description: "Manage reaction roles",
    options: [
      { name: "create", description: "Create a reaction role", type: 1, options: [
        { name: "channel", description: "Channel", type: 7, required: true },
        { name: "role", description: "Role to assign", type: 8, required: true },
        { name: "emoji", description: "Emoji for the reaction", type: 3, required: true },
        { name: "label", description: "Display label", type: 3, required: false },
        { name: "message_id", description: "Existing message ID", type: 3, required: false },
      ]},
      { name: "delete", description: "Delete a reaction role", type: 1, options: [{ name: "id", description: "Reaction role ID", type: 3, required: true }] },
      { name: "list", description: "List reaction roles", type: 1 },
      { name: "panel", description: "Send reaction role panel", type: 1, options: [{ name: "channel", description: "Channel to send to", type: 7, required: true }] },
    ],
  },
  { name: "announce", description: "Send an announcement embed", options: [
    { name: "channel", description: "Channel", type: 7, required: true },
    { name: "message", description: "Announcement text", type: 3, required: false },
    { name: "title", description: "Embed title", type: 3, required: false },
    { name: "color", description: "Color (hex)", type: 3, required: false },
    { name: "ping", description: "Ping role", type: 3, required: false, choices: [{ name: "@everyone", value: "everyone" }, { name: "@here", value: "here" }] },
    { name: "image", description: "Image URL", type: 3, required: false },
    { name: "footer", description: "Footer text", type: 3, required: false },
  ]},
  { name: "say", description: "Make the bot say something", options: [
    { name: "message", description: "Message text", type: 3, required: true },
    { name: "channel", description: "Channel (defaults to current)", type: 7, required: false },
  ]},
  { name: "embed", description: "Send a custom embed", options: [
    { name: "channel", description: "Channel", type: 7, required: true },
    { name: "title", description: "Embed title", type: 3, required: false },
    { name: "description", description: "Embed description", type: 3, required: false },
    { name: "color", description: "Color (hex)", type: 3, required: false },
    { name: "footer", description: "Footer text", type: 3, required: false },
    { name: "image", description: "Image URL", type: 3, required: false },
    { name: "thumbnail", description: "Thumbnail URL", type: 3, required: false },
    { name: "author", description: "Author name", type: 3, required: false },
    { name: "author_icon", description: "Author icon URL", type: 3, required: false },
  ]},
  {
    name: "poll", description: "Create and manage polls",
    options: [
      { name: "create", description: "Create a poll", type: 1, options: [
        { name: "channel", description: "Channel", type: 7, required: true },
        { name: "title", description: "Poll title", type: 3, required: true },
        { name: "description", description: "Poll description", type: 3, required: false },
        { name: "options", description: "Options separated by |", type: 3, required: true },
        { name: "allow_multiple", description: "Allow multiple choices", type: 5, required: false },
        { name: "duration_hours", description: "Duration in hours", type: 4, required: false },
      ]},
      { name: "end", description: "End a poll and show results", type: 1, options: [{ name: "id", description: "Poll ID", type: 3, required: true }] },
    ],
  },
  {
    name: "ticket", description: "Manage support tickets",
    options: [
      { name: "create", description: "Create a support ticket", type: 1, options: [
        { name: "subject", description: "Ticket subject", type: 3, required: true },
        { name: "priority", description: "Priority", type: 3, required: false, choices: [{ name: "Low", value: "low" }, { name: "Normal", value: "normal" }, { name: "High", value: "high" }, { name: "Urgent", value: "urgent" }] },
      ]},
      { name: "close", description: "Close this ticket (mod only)", type: 1, options: [{ name: "reason", description: "Close reason", type: 3, required: false }] },
      { name: "claim", description: "Claim this ticket (mod only)", type: 1 },
      { name: "add", description: "Add a user to this ticket (mod only)", type: 1, options: [{ name: "user", description: "User to add", type: 6, required: true }] },
      { name: "remove", description: "Remove a user from this ticket (mod only)", type: 1, options: [{ name: "user", description: "User to remove", type: 6, required: true }] },
    ],
  },
];
