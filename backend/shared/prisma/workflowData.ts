export enum ServicesId {
	github = 1,
	discord = 2,
	reddit = 3,
	slack = 4,
	spotify = 5,
	timer = 6
}

export enum ActionsId {
	githubPush = 1,
	timerDaily = 2,        // Déclenche tous les jours à une heure précise
	timerDate = 3,         // Déclenche à une date annuelle (DD/MM)
	timerFutureDate = 4,   // Déclenche dans X jours
	spotifyTrackSaved = 5, // Déclenche quand l'utilisateur like une nouvelle track
	redditNewPost = 6,     // Déclenche quand un nouveau post est créé dans un subreddit
	slackNewMessage = 7    // Déclenche quand un nouveau message est posté dans un channel Slack
}

export enum ReactionsId {
    discordMessage = 1,
    discordDM = 2,
    discordCreateChannel = 3,
    discordAddRole = 4,
    discordDeleteMessage = 5,
    discordEditMessage = 6,
    discordAddReaction = 7,
    discordKickMember = 8,
    discordBanMember = 9,
    discordCreateRole = 10
}