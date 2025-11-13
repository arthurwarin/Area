import { useState, useEffect } from 'react';

const LINK_API_URL = process.env.NEXT_PUBLIC_LINK_URL || 'http://localhost:8084';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  botPresent: boolean;
}

interface Channel {
  id: string;
  name: string;
  position: number;
}

interface DiscordFieldsProps {
  guildId: string;
  channelId: string;
  message: string;
  onGuildChange: (guildId: string) => void;
  onChannelChange: (channelId: string) => void;
  onMessageChange: (message: string) => void;
}

export function DiscordFields({ guildId, channelId, message, onGuildChange, onChannelChange, onMessageChange }: DiscordFieldsProps) {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loadingGuilds, setLoadingGuilds] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [error, setError] = useState('');
  const [botInviteUrl, setBotInviteUrl] = useState('');

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log('[DiscordFields] Fetching guilds with token:', token ? 'present' : 'missing');
        
        const response = await fetch(`${LINK_API_URL}/discord/guilds`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error('[DiscordFields] Failed to fetch guilds:', response.status, response.statusText);
          throw new Error('Failed to fetch Discord servers');
        }

        const data = await response.json();
        console.log('[DiscordFields] Guilds received:', data.guilds?.length || 0);
        setGuilds(data.guilds || []);
      } catch (err) {
        console.error('[DiscordFields] Error fetching guilds:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Discord servers');
      } finally {
        setLoadingGuilds(false);
      }
    };

    fetchGuilds();
  }, []);

  useEffect(() => {
    if (!guildId) {
      setChannels([]);
      return;
    }

    const fetchChannels = async () => {
      setLoadingChannels(true);
      setError('');
      setBotInviteUrl('');
      
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${LINK_API_URL}/discord/guilds/${guildId}/channels`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 403) {
          const data = await response.json();
          setBotInviteUrl(data.inviteUrl || '');
          setError('Bot not in this server. Please invite the bot first.');
          setChannels([]);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }

        const data = await response.json();
        setChannels(data.channels || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load channels');
        setChannels([]);
      } finally {
        setLoadingChannels(false);
      }
    };

    fetchChannels();
  }, [guildId]);

  if (loadingGuilds) {
    return (
      <div className="bg-gray-700 px-4 py-3 rounded-lg">
        <p className="text-sm text-gray-400">Loading Discord servers...</p>
      </div>
    );
  }

  console.log('[DiscordFields] Render state:', {
    guildsCount: guilds.length,
    guildId,
    channelId,
    loadingChannels,
    error
  });

  if (!guilds.length) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg px-4 py-3">
        <p className="text-sm text-yellow-400">
          ⚠️ No Discord servers found. Please connect your Discord account first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Guild Selector */}
      <div>
        <label htmlFor="discord-guild" className="block text-xs font-medium text-gray-400 mb-1">
          Discord Server (Guild) *
        </label>
        <select
          id="discord-guild"
          value={guildId || ''}
          onChange={(e) => {
            console.log('[DiscordFields] Guild selected:', e.target.value);
            onGuildChange(e.target.value);
            onChannelChange('');
          }}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Select a Discord server...</option>
          {guilds.map(guild => (
            <option key={guild.id} value={guild.id}>
              {guild.name} {!guild.botPresent && '(⚠️ Bot not present)'}
            </option>
          ))}
        </select>
      </div>

      {/* Channel Selector */}
      {guildId && (
        <div>
          <label htmlFor="discord-channel" className="block text-xs font-medium text-gray-400 mb-1">
            Channel *
          </label>
          
          {botInviteUrl && (
            <div className="mb-2 bg-orange-500/10 border border-orange-500/50 rounded-lg px-4 py-3">
              <p className="text-sm text-orange-400 mb-2">
                🤖 The bot needs to be added to this server first
              </p>
              <a
                href={botInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                Invite Bot to Server
              </a>
              <p className="text-xs text-orange-300 mt-2">
                After adding the bot, refresh this page to see channels
              </p>
            </div>
          )}

          {loadingChannels ? (
            <div className="bg-gray-700 px-4 py-3 rounded-lg">
              <p className="text-sm text-gray-400">Loading channels...</p>
            </div>
          ) : channels.length > 0 ? (
            <select
              id="discord-channel"
              value={channelId || ''}
              onChange={(e) => {
                console.log('[DiscordFields] Channel selected:', e.target.value);
                onChannelChange(e.target.value);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Select a channel...</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>
                  # {channel.name}
                </option>
              ))}
            </select>
          ) : !botInviteUrl && (
            <div className="bg-gray-700 px-4 py-3 rounded-lg">
              <p className="text-sm text-gray-400">No text channels available</p>
            </div>
          )}
        </div>
      )}

      {/* Message Field */}
      {channelId && (
        <div>
          <label htmlFor="discord-message" className="block text-xs font-medium text-gray-400 mb-1">
            Message *
          </label>
          <textarea
            id="discord-message"
            value={message || ''}
            onChange={(e) => {
              console.log('[DiscordFields] Message changed:', e.target.value);
              onMessageChange(e.target.value);
            }}
            placeholder="Enter message to send to Discord..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            rows={3}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This message will be sent to #{channels.find(c => c.id === channelId)?.name || 'channel'} when the workflow triggers
          </p>
        </div>
      )}

      {error && !botInviteUrl && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
