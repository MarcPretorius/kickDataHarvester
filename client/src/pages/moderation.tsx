import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getQueryFn, apiRequest } from '@/lib/queryClient';
import { AlertCircle, Check, Flag, Eye, EyeOff, Filter, Search, MessageSquare, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types for our frontend
type ChatMessage = {
  id: number;
  channelId: number;
  userId: string;
  username: string;
  userType: string;
  message: string;
  timestamp: string;
  isHidden: boolean;
  isFlagged: boolean;
  moderationReason: string | null;
  moderatedBy: string | null;
  moderatedAt: string | null;
};

type ContentFilter = {
  id: number;
  keyword: string;
  type: string;
  replacement: string | null;
  isActive: boolean;
  createdAt: string;
  createdBy: string | null;
};

export default function ModerationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [moderationReason, setModerationReason] = useState('');
  const [newFilter, setNewFilter] = useState({
    keyword: '',
    type: 'block',
    replacement: '',
    isActive: true
  });

  // Query for flagged messages
  const flaggedMessagesQuery = useQuery<{messages: ChatMessage[]}>({
    queryKey: ['/api/messages/flagged'],
    queryFn: getQueryFn({ on401: 'returnNull' })
  });

  // Query for content filters
  const filtersQuery = useQuery<ContentFilter[]>({
    queryKey: ['/api/filters'],
    queryFn: getQueryFn({ on401: 'returnNull' })
  });

  // Query for searched messages
  const searchMessagesQuery = useQuery<{messages: ChatMessage[]}>({
    queryKey: ['/api/messages/search', searchTerm],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!searchTerm
  });

  // Mutation for moderating messages
  const moderateMessageMutation = useMutation({
    mutationFn: async (params: { 
      messageId: number; 
      action: 'hide' | 'unhide' | 'flag' | 'unflag';
      reason?: string;
    }) => {
      return apiRequest('/api/messages/moderate', 'POST', {
        messageId: params.messageId,
        action: params.action,
        reason: params.reason || null,
        moderatedBy: 'Admin'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/flagged'] });
      if (searchTerm) {
        queryClient.invalidateQueries({ queryKey: ['/api/messages/search', searchTerm] });
      }
      toast({
        title: 'Success',
        description: 'Message moderation action completed',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to moderate message',
        variant: 'destructive'
      });
      console.error('Moderation error:', error);
    }
  });

  // Mutation for creating content filters
  const createFilterMutation = useMutation({
    mutationFn: async (filter: any) => {
      return apiRequest('/api/filters', 'POST', filter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/filters'] });
      setNewFilter({
        keyword: '',
        type: 'block',
        replacement: '',
        isActive: true
      });
      toast({
        title: 'Success',
        description: 'Content filter created',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create content filter',
        variant: 'destructive'
      });
      console.error('Filter creation error:', error);
    }
  });

  // Mutation for updating content filters
  const updateFilterMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest(`/api/filters/${id}`, 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/filters'] });
      toast({
        title: 'Success',
        description: 'Content filter updated',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update content filter',
        variant: 'destructive'
      });
      console.error('Filter update error:', error);
    }
  });

  // Mutation for deleting content filters
  const deleteFilterMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/filters/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/filters'] });
      toast({
        title: 'Success',
        description: 'Content filter deleted',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete content filter',
        variant: 'destructive'
      });
      console.error('Filter deletion error:', error);
    }
  });

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/search', searchTerm] });
    }
  };

  // Handle moderation action
  const handleModerateMessage = (messageId: number, action: 'hide' | 'unhide' | 'flag' | 'unflag') => {
    moderateMessageMutation.mutate({
      messageId,
      action,
      reason: moderationReason
    });
    setModerationReason('');
  };

  // Handle filter creation
  const handleCreateFilter = (e: React.FormEvent) => {
    e.preventDefault();
    createFilterMutation.mutate({
      ...newFilter,
      createdBy: 'Admin'
    });
  };

  // Handle filter toggle (active/inactive)
  const handleToggleFilter = (id: number, isCurrentlyActive: boolean) => {
    updateFilterMutation.mutate({
      id,
      updates: { isActive: !isCurrentlyActive }
    });
  };

  // Handle filter deletion
  const handleDeleteFilter = (id: number) => {
    if (confirm('Are you sure you want to delete this filter?')) {
      deleteFilterMutation.mutate(id);
    }
  };

  // Render helper for message items
  const renderMessage = (message: ChatMessage) => (
    <Card key={message.id} className={`mb-4 ${message.isHidden ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{message.username}</CardTitle>
            <Badge variant={message.userType === 'moderator' ? 'default' : message.userType === 'subscriber' ? 'outline' : 'secondary'}>
              {message.userType}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(message.timestamp).toLocaleString()}
          </div>
        </div>
        {message.isFlagged && (
          <div className="flex items-center gap-2 text-orange-500 text-sm mt-1">
            <AlertTriangle size={16} /> Flagged
            {message.moderationReason && <span>- Reason: {message.moderationReason}</span>}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className={message.isHidden ? 'line-through text-muted-foreground' : ''}>
          {message.message}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Input 
            placeholder="Reason for moderation (optional)"
            value={moderationReason}
            onChange={(e) => setModerationReason(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          {message.isHidden ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleModerateMessage(message.id, 'unhide')}
              disabled={moderateMessageMutation.isPending}
            >
              <Eye className="mr-2 h-4 w-4" /> Show
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleModerateMessage(message.id, 'hide')}
              disabled={moderateMessageMutation.isPending}
            >
              <EyeOff className="mr-2 h-4 w-4" /> Hide
            </Button>
          )}
          
          {message.isFlagged ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleModerateMessage(message.id, 'unflag')}
              disabled={moderateMessageMutation.isPending}
            >
              <Check className="mr-2 h-4 w-4" /> Unflag
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleModerateMessage(message.id, 'flag')}
              disabled={moderateMessageMutation.isPending}
            >
              <Flag className="mr-2 h-4 w-4" /> Flag
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Message Moderation Tools</h1>
        
        <Tabs defaultValue="flagged" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="flagged" className="flex items-center">
              <Flag className="mr-2 h-4 w-4" /> Flagged Messages
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center">
              <Search className="mr-2 h-4 w-4" /> Search Messages
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center">
              <Filter className="mr-2 h-4 w-4" /> Content Filters
            </TabsTrigger>
          </TabsList>
          
          {/* Flagged Messages Tab */}
          <TabsContent value="flagged">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Messages</CardTitle>
                <CardDescription>
                  Review and moderate messages that have been flagged for review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {flaggedMessagesQuery.isLoading ? (
                  <div className="text-center py-8">Loading flagged messages...</div>
                ) : flaggedMessagesQuery.isError ? (
                  <div className="text-center py-8 text-red-500">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8" />
                    Error loading flagged messages
                  </div>
                ) : flaggedMessagesQuery.data?.messages?.length > 0 ? (
                  <div>
                    {flaggedMessagesQuery.data.messages.map(renderMessage)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                    No flagged messages found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Search Messages Tab */}
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Search Messages</CardTitle>
                <CardDescription>
                  Search for specific messages by content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                  <Input
                    type="text"
                    placeholder="Search for messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!searchTerm.trim() || searchMessagesQuery.isFetching}>
                    <Search className="mr-2 h-4 w-4" /> Search
                  </Button>
                </form>
                
                {searchMessagesQuery.isLoading ? (
                  <div className="text-center py-8">Searching messages...</div>
                ) : searchMessagesQuery.isError ? (
                  <div className="text-center py-8 text-red-500">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8" />
                    Error searching messages
                  </div>
                ) : searchMessagesQuery.data?.messages?.length > 0 ? (
                  <div>
                    {searchMessagesQuery.data.messages.map(renderMessage)}
                  </div>
                ) : searchTerm ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                    No messages found matching "{searchTerm}"
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Enter a search term above to find messages
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Content Filters Tab */}
          <TabsContent value="filters">
            <Card>
              <CardHeader>
                <CardTitle>Content Filters</CardTitle>
                <CardDescription>
                  Create and manage content filters to automatically flag or block messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateFilter} className="mb-6 p-4 border rounded-lg bg-card">
                  <h3 className="text-lg font-semibold mb-4">Add New Filter</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Keyword</label>
                      <Input
                        type="text"
                        placeholder="Enter keyword to filter"
                        value={newFilter.keyword}
                        onChange={(e) => setNewFilter({...newFilter, keyword: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Filter Type</label>
                      <select
                        className="w-full rounded-md border border-input px-3 py-2 bg-background"
                        value={newFilter.type}
                        onChange={(e) => setNewFilter({...newFilter, type: e.target.value})}
                        required
                      >
                        <option value="block">Block (hide messages)</option>
                        <option value="flag">Flag (mark for review)</option>
                        <option value="replace">Replace (with text)</option>
                      </select>
                    </div>
                  </div>
                  
                  {newFilter.type === 'replace' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Replacement Text</label>
                      <Input
                        type="text"
                        placeholder="Text to replace the keyword with"
                        value={newFilter.replacement || ''}
                        onChange={(e) => setNewFilter({...newFilter, replacement: e.target.value})}
                        required={newFilter.type === 'replace'}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={newFilter.isActive}
                      onChange={(e) => setNewFilter({...newFilter, isActive: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={createFilterMutation.isPending || !newFilter.keyword.trim() || (newFilter.type === 'replace' && !newFilter.replacement)}
                  >
                    Add Filter
                  </Button>
                </form>
                
                <h3 className="text-xl font-semibold mb-4">Current Filters</h3>
                
                {filtersQuery.isLoading ? (
                  <div className="text-center py-8">Loading filters...</div>
                ) : filtersQuery.isError ? (
                  <div className="text-center py-8 text-red-500">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8" />
                    Error loading content filters
                  </div>
                ) : filtersQuery.data?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Keyword</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Replacement</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtersQuery.data.map((filter: ContentFilter) => (
                          <tr key={filter.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{filter.keyword}</td>
                            <td className="p-2 capitalize">{filter.type}</td>
                            <td className="p-2">{filter.replacement || '-'}</td>
                            <td className="p-2">
                              <Badge variant={filter.isActive ? 'default' : 'secondary'}>
                                {filter.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleToggleFilter(filter.id, filter.isActive)}
                                  disabled={updateFilterMutation.isPending}
                                >
                                  {filter.isActive ? 'Disable' : 'Enable'}
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => handleDeleteFilter(filter.id)}
                                  disabled={deleteFilterMutation.isPending}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Filter className="mx-auto mb-2 h-8 w-8" />
                    No content filters created yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}