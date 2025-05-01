import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { X, Bell, BellOff, Info, Volume2, Tag } from "lucide-react";
import { useKeywordNotification } from "@/hooks/useKeywordNotification";

interface KeywordFilterProps {
  initialKeywords?: string[];
  onMatchFound?: (message: any, keyword: string) => void;
}

const KeywordFilter = ({ initialKeywords = [], onMatchFound }: KeywordFilterProps) => {
  const [newKeyword, setNewKeyword] = useState('');
  const {
    isEnabled,
    setIsEnabled,
    keywordList,
    caseSensitive,
    setCaseSensitive,
    matches,
    addKeyword,
    removeKeyword,
    clearKeywords,
    clearMatches
  } = useKeywordNotification(initialKeywords, {
    enabled: true,
    caseSensitive: false,
    onMatch: onMatchFound
  });

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim()) {
      const added = addKeyword(newKeyword.trim());
      if (added) {
        setNewKeyword('');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-neutral-100">
        <CardTitle className="text-base font-medium flex items-center">
          <Tag className="h-4 w-4 mr-2" />
          Keyword Notifications
        </CardTitle>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch 
              id="notification-toggle" 
              checked={isEnabled} 
              onCheckedChange={setIsEnabled} 
            />
            <Label htmlFor="notification-toggle" className="cursor-pointer">
              {isEnabled ? (
                <span className="flex items-center text-primary">
                  <Bell className="h-4 w-4 mr-1" />
                  Enabled
                </span>
              ) : (
                <span className="flex items-center text-neutral-500">
                  <BellOff className="h-4 w-4 mr-1" />
                  Disabled
                </span>
              )}
            </Label>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="space-y-4">
          <form onSubmit={handleAddKeyword} className="flex gap-2">
            <Input
              placeholder="Add keyword to monitor..." 
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Add</Button>
          </form>
          
          <div className="flex flex-wrap gap-2">
            {keywordList.length > 0 ? (
              keywordList.map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {keyword}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 p-0 ml-1.5 rounded-full hover:bg-primary hover:text-white"
                    onClick={() => removeKeyword(keyword)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-neutral-500">No keywords added yet. Add keywords to receive notifications when they appear in chat.</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="case-sensitive" 
                checked={caseSensitive} 
                onCheckedChange={setCaseSensitive} 
              />
              <Label htmlFor="case-sensitive">Case Sensitive</Label>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearKeywords}
              disabled={keywordList.length === 0}
              className="ml-auto"
            >
              Clear All Keywords
            </Button>
          </div>
          
          {keywordList.length > 0 && (
            <div className="bg-amber-50 p-3 rounded-md text-sm text-amber-800 flex items-start">
              <Info className="h-4 w-4 mr-2 mt-0.5" />
              <div>
                <p>When a message contains any of your keywords, a notification sound will play.</p>
                <p className="flex items-center mt-1">
                  <Volume2 className="h-4 w-4 mr-1" />
                  Make sure your device sound is turned on.
                </p>
              </div>
            </div>
          )}
          
          {matches.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="matches">
                <AccordionTrigger className="text-sm font-medium">
                  Recent Matches ({matches.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                    {matches.map((match, index) => (
                      <div key={index} className="p-2 bg-neutral-50 rounded-md text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{match.message.username}</span>
                          <Badge variant="outline" className="text-xs">
                            Matched: {match.keyword}
                          </Badge>
                        </div>
                        <p className="truncate">{match.message.message}</p>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearMatches}
                    className="mt-2"
                  >
                    Clear History
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KeywordFilter;