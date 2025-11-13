'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../../../../components/AuthGuard';
import { workflowService, Service, Action, Reaction, CreateWorkflowPayload } from '../../../../services/workflowService';
import { getActionFields, getReactionFields } from '../../../../utils/workflowFieldsFallback';
import { DiscordFields } from '../../../../components/DiscordFields';
import { TimerFields } from '../../../../components/TimerFields';

function CreateWorkflowPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedActionService, setSelectedActionService] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [actionData, setActionData] = useState<string[]>([]);
  const [selectedReactionService, setSelectedReactionService] = useState<number | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null);
  const [reactionData, setReactionData] = useState<string[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesData = await workflowService.getServices();
        setServices(servicesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const availableActions = selectedActionService
    ? services.find(s => s.id === selectedActionService)?.actions || []
    : [];

  const availableReactions = selectedReactionService
    ? services.find(s => s.id === selectedReactionService)?.reactions || []
    : [];

  const handleActionServiceChange = (serviceId: number) => {
    setSelectedActionService(serviceId);
    setSelectedAction(null);
    setActionData([]);
  };

  const handleActionChange = (actionId: number) => {
    const action = availableActions.find(a => a.id === actionId);
    setSelectedAction(action || null);
    if (action) {
      const fields = getActionFields(action);
      setActionData(new Array(fields.length).fill(''));
    } else {
      setActionData([]);
    }
  };

  const handleReactionServiceChange = (serviceId: number) => {
    setSelectedReactionService(serviceId);
    setSelectedReaction(null);
    setReactionData([]);
  };

  const handleReactionChange = (reactionId: number) => {
    const reaction = availableReactions.find(r => r.id === reactionId);
    setSelectedReaction(reaction || null);
    
    if (reaction) {
      // Special handling for Discord reactions (ids 1-10)
      if (reaction.id >= 1 && reaction.id <= 10) {
        // Determine how many fields each Discord reaction needs
        const discordFieldCounts: Record<number, number> = {
          1: 2,  // discordMessage: [channelId, message] (+1 for guildId in UI = 3)
          2: 2,  // discordDM: [discordUserId, message]
          3: 2,  // discordCreateChannel: [guildId, channelName]
          4: 3,  // discordAddRole: [guildId, discordUserId, roleId]
          5: 2,  // discordDeleteMessage: [channelId, messageId]
          6: 3,  // discordEditMessage: [channelId, messageId, newContent]
          7: 3,  // discordAddReaction: [channelId, messageId, emoji]
          8: 2,  // discordKickMember: [guildId, discordUserId]
          9: 2,  // discordBanMember: [guildId, discordUserId]
          10: 2, // discordCreateRole: [guildId, roleName]
        };
        
        const fieldCount = discordFieldCounts[reaction.id] || 2;
        // For discordMessage (id=1), add extra slot for guildId (UI only)
        const arrayLength = reaction.id === 1 ? 3 : fieldCount;
        
        console.log('[CreateWorkflow] Initializing Discord reaction', reaction.id, 'with', arrayLength, 'slots');
        setReactionData(new Array(arrayLength).fill(''));
      } else {
        // For all other reactions, use the standard approach
        const fields = getReactionFields(reaction);
        console.log('[CreateWorkflow] Initializing reaction', reactionId, 'with', fields.length, 'fields');
        setReactionData(new Array(fields.length).fill(''));
      }
    } else {
      setReactionData([]);
    }
  };

  const handleActionDataChange = (index: number, value: string) => {
    const newData = [...actionData];
    newData[index] = value;
    setActionData(newData);
  };

  const handleReactionDataChange = (index: number, value: string) => {
    const newData = [...reactionData];
    newData[index] = value;
    setReactionData(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workflowName.trim()) {
      setError('Workflow name is required');
      return;
    }

    if (!selectedAction) {
      setError('Please select an action');
      return;
    }

    if (!selectedReaction) {
      setError('Please select a reaction');
      return;
    }

    // Validate that all required action fields are filled
    const actionFields = getActionFields(selectedAction);
    if (actionFields.length > 0) {
      const missingActionFields = actionData.some((value, index) => !value || !value.trim());
      if (missingActionFields) {
        setError('Please fill all required action configuration fields');
        return;
      }
      if (actionData.length !== actionFields.length) {
        setError(`Action requires exactly ${actionFields.length} configuration fields`);
        return;
      }
    }

    // Validate reaction data
    if (selectedReaction.id >= 1 && selectedReaction.id <= 10) {
      // Special validation for all Discord reactions
      const hasEmptyFields = reactionData.some((value, index) => {
        // For discordMessage (id=1), skip validation of guildId (index 2)
        if (selectedReaction.id === 1 && index === 2) return false;
        return !value || !value.trim();
      });
      
      if (hasEmptyFields) {
        setError('Please fill all required Discord configuration fields');
        return;
      }
    } else {
      // Existing validation for other reactions
      const reactionFields = getReactionFields(selectedReaction);
      if (reactionFields.length > 0) {
        const missingReactionFields = reactionData.some((value, index) => !value || !value.trim());
        if (missingReactionFields) {
          setError('Please fill all required reaction configuration fields');
          return;
        }
        if (reactionData.length !== reactionFields.length) {
          setError(`Reaction requires exactly ${reactionFields.length} configuration fields`);
          return;
        }
      }
    }

    setIsSaving(true);
    setError('');

    try {
      // For Discord Message reaction, only send [channelId, message] to backend (not guildId)
      const cleanReactionData = selectedReaction.id === 1 
        ? [reactionData[0], reactionData[1]] // Only channelId and message
        : reactionData;

      console.log('[CreateWorkflow] Submitting with reactionData:', cleanReactionData);

      const payload: CreateWorkflowPayload = {
        name: workflowName,
        description: workflowDescription || undefined,
        action: {
          id: selectedAction.id,
          data: actionData
        },
        reaction: {
          id: selectedReaction.id,
          data: cleanReactionData
        }
      };

      await workflowService.createWorkflow(payload);
      router.push('/user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/user')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-3xl font-bold text-white">Create New Workflow</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Workflow Info */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Workflow Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Workflow Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="e.g., Send Discord notification on GitHub push"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Describe what this workflow does..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Action Configuration */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  1
                </div>
                <h2 className="text-xl font-semibold text-white">When this happens... (Action)</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="actionService" className="block text-sm font-medium text-gray-300 mb-2">
                    Select Service *
                  </label>
                  <select
                    id="actionService"
                    value={selectedActionService || ''}
                    onChange={(e) => handleActionServiceChange(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a service...</option>
                    {services
                      .filter(s => s.actions && s.actions.length > 0)
                      .map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                  </select>
                </div>

                {availableActions.length > 0 && (
                  <div>
                    <label htmlFor="action" className="block text-sm font-medium text-gray-300 mb-2">
                      Select Action *
                    </label>
                    <select
                      id="action"
                      value={selectedAction?.id || ''}
                      onChange={(e) => handleActionChange(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    >
                      <option value="">Choose an action...</option>
                      {availableActions.map(action => (
                        <option key={action.id} value={action.id}>
                          {action.name}
                        </option>
                      ))}
                    </select>
                    {selectedAction && selectedAction.description && (
                      <p className="mt-2 text-sm text-gray-400">{selectedAction.description}</p>
                    )}
                  </div>
                )}

                {selectedAction && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Action Configuration
                    </label>
                    {(() => {
                      const fields = getActionFields(selectedAction);
                      const isUsingFallback = !selectedAction.data && fields.length > 0;
                      
                      if (fields.length === 0) {
                        return (
                          <p className="text-sm text-gray-400 italic bg-gray-700 px-4 py-3 rounded-lg">
                            ℹ️ No configuration needed for this action
                          </p>
                        );
                      }

                      // Special UI for Timer Actions (actionId 2, 3, 4)
                      if (selectedAction.id >= 2 && selectedAction.id <= 4) {
                        return (
                          <>
                            {isUsingFallback && (
                              <div className="mb-3 bg-blue-500/10 border border-blue-500/50 rounded-lg px-4 py-2">
                                <p className="text-xs text-blue-400">
                                  💡 Using Timer integration (backend data field missing)
                                </p>
                              </div>
                            )}
                            <TimerFields
                              actionId={selectedAction.id}
                              data={actionData}
                              onDataChange={(data) => {
                                console.log('[CreateWorkflow] Timer data changed:', data);
                                setActionData(data);
                              }}
                            />
                          </>
                        );
                      }
                      
                      return (
                        <>
                          {isUsingFallback && (
                            <div className="mb-3 bg-blue-500/10 border border-blue-500/50 rounded-lg px-4 py-2">
                              <p className="text-xs text-blue-400">
                                💡 Using fallback configuration (backend data field missing)
                              </p>
                            </div>
                          )}
                          <div className="space-y-3">
                            {fields.map((fieldName: string, index: number) => (
                              <div key={index}>
                                <label htmlFor={`action-field-${index}`} className="block text-xs font-medium text-gray-400 mb-1">
                                  {fieldName} *
                                </label>
                                <input
                                  id={`action-field-${index}`}
                                  type="text"
                                  value={actionData[index] || ''}
                                  onChange={(e) => handleActionDataChange(index, e.target.value)}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                  placeholder={`Enter ${fieldName}`}
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Reaction Configuration */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  2
                </div>
                <h2 className="text-xl font-semibold text-white">Do this... (Reaction)</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="reactionService" className="block text-sm font-medium text-gray-300 mb-2">
                    Select Service *
                  </label>
                  <select
                    id="reactionService"
                    value={selectedReactionService || ''}
                    onChange={(e) => handleReactionServiceChange(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a service...</option>
                    {services
                      .filter(s => s.reactions && s.reactions.length > 0)
                      .map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                  </select>
                </div>

                {availableReactions.length > 0 && (
                  <div>
                    <label htmlFor="reaction" className="block text-sm font-medium text-gray-300 mb-2">
                      Select Reaction *
                    </label>
                    <select
                      id="reaction"
                      value={selectedReaction?.id || ''}
                      onChange={(e) => handleReactionChange(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Choose a reaction...</option>
                      {availableReactions.map(reaction => (
                        <option key={reaction.id} value={reaction.id}>
                          {reaction.name}
                        </option>
                      ))}
                    </select>
                    {selectedReaction && selectedReaction.description && (
                      <p className="mt-2 text-sm text-gray-400">{selectedReaction.description}</p>
                    )}
                  </div>
                )}

                {selectedReaction && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reaction Configuration
                    </label>
                    {(() => {
                      // Special handling for Discord Send Message (uses custom component)
                      if (selectedReaction.id === 1) {
                        return (
                          <DiscordFields
                            guildId={reactionData[2] || ''} 
                            channelId={reactionData[0] || ''}
                            message={reactionData[1] || ''}
                            onGuildChange={(guildId) => {
                              setReactionData(prevData => {
                                const newData = prevData.length >= 3 ? [...prevData] : ['', '', ''];
                                newData[0] = prevData[0] || '';
                                newData[1] = prevData[1] || '';
                                newData[2] = guildId;
                                return newData;
                              });
                            }}
                            onChannelChange={(channelId) => {
                              setReactionData(prevData => {
                                const newData = prevData.length >= 3 ? [...prevData] : ['', '', ''];
                                newData[0] = channelId;
                                newData[1] = prevData[1] || '';
                                newData[2] = prevData[2] || '';
                                return newData;
                              });
                            }}
                            onMessageChange={(message) => {
                              setReactionData(prevData => {
                                const newData = prevData.length >= 3 ? [...prevData] : ['', '', ''];
                                newData[0] = prevData[0] || '';
                                newData[1] = message;
                                newData[2] = prevData[2] || '';
                                return newData;
                              });
                            }}
                          />
                        );
                      }
                      
                      // For ALL other Discord reactions (2-10), show generic fields with hardcoded labels
                      if (selectedReaction.id >= 2 && selectedReaction.id <= 10) {
                        const discordFieldLabels: Record<number, string[]> = {
                          2: ['Discord User ID', 'Message'],                    // discordDM
                          3: ['Guild/Server ID', 'Channel Name'],               // discordCreateChannel
                          4: ['Guild/Server ID', 'Discord User ID', 'Role ID'], // discordAddRole
                          5: ['Channel ID', 'Message ID'],                      // discordDeleteMessage
                          6: ['Channel ID', 'Message ID', 'New Content'],       // discordEditMessage
                          7: ['Channel ID', 'Message ID', 'Emoji'],             // discordAddReaction
                          8: ['Guild/Server ID', 'Discord User ID'],            // discordKickMember
                          9: ['Guild/Server ID', 'Discord User ID'],            // discordBanMember
                          10: ['Guild/Server ID', 'Role Name'],                 // discordCreateRole
                        };
                        
                        const fieldLabels = discordFieldLabels[selectedReaction.id] || [];
                        
                        return (
                          <div className="space-y-3">
                            {fieldLabels.map((fieldLabel: string, index: number) => (
                              <div key={index}>
                                <label htmlFor={`reaction-field-${index}`} className="block text-xs font-medium text-gray-400 mb-1">
                                  {fieldLabel} *
                                </label>
                                <input
                                  id={`reaction-field-${index}`}
                                  type="text"
                                  value={reactionData[index] || ''}
                                  onChange={(e) => handleReactionDataChange(index, e.target.value)}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder={`Enter ${fieldLabel}`}
                                  required
                                />
                                {/* Helpful tip for Discord User ID */}
                                {index === 0 && (selectedReaction.id === 2 || selectedReaction.id === 4 || selectedReaction.id === 8 || selectedReaction.id === 9) && fieldLabel.includes('User ID') && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    💡 Tip: Right-click on the user in Discord → Copy User ID (enable Developer Mode in Settings first)
                                  </p>
                                )}
                                {/* Helpful tip for Guild/Server ID */}
                                {index === 0 && fieldLabel.includes('Guild') && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    💡 Tip: Right-click on the server icon → Copy Server ID (enable Developer Mode in Settings first)
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      // For non-Discord reactions, use the existing logic
                      const fields = getReactionFields(selectedReaction);
                      const isUsingFallback = !selectedReaction.data && fields.length > 0;
                      
                      if (fields.length === 0) {
                        return (
                          <p className="text-sm text-gray-400 italic bg-gray-700 px-4 py-3 rounded-lg">
                            ℹ️ No configuration needed for this reaction
                          </p>
                        );
                      }
                      
                      return (
                        <>
                          {isUsingFallback && (
                            <div className="mb-3 bg-blue-500/10 border border-blue-500/50 rounded-lg px-4 py-2">
                              <p className="text-xs text-blue-400">
                                💡 Using fallback configuration (backend data field missing)
                              </p>
                            </div>
                          )}
                          <div className="space-y-3">
                            {fields.map((fieldName: string, index: number) => (
                              <div key={index}>
                                <label htmlFor={`reaction-field-${index}`} className="block text-xs font-medium text-gray-400 mb-1">
                                  {fieldName} *
                                </label>
                                <input
                                  id={`reaction-field-${index}`}
                                  type="text"
                                  value={reactionData[index] || ''}
                                  onChange={(e) => handleReactionDataChange(index, e.target.value)}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder={`Enter ${fieldName}`}
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => router.push('/user')}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  'Create Workflow'
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}

export default CreateWorkflowPage;