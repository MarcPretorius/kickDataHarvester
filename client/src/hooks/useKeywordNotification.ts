import { useState, useEffect, useCallback } from 'react';
import useSound from 'use-sound';

// Sound file path relative to the public directory
const NOTIFICATION_SOUND = '/notification.mp3';

interface KeywordNotificationOptions {
  enabled?: boolean;
  caseSensitive?: boolean;
  onMatch?: (message: any, keyword: string) => void;
}

export const useKeywordNotification = (
  keywords: string[] = [],
  options: KeywordNotificationOptions = {}
) => {
  const [isEnabled, setIsEnabled] = useState(options.enabled ?? true);
  const [keywordList, setKeywordList] = useState<string[]>(keywords);
  const [matches, setMatches] = useState<{message: any, keyword: string}[]>([]);
  const [caseSensitive, setCaseSensitive] = useState(options.caseSensitive ?? false);

  // Initialize sound
  const [play] = useSound(NOTIFICATION_SOUND, { 
    volume: 0.5 
  });

  // Add a new keyword to the list
  const addKeyword = useCallback((keyword: string) => {
    if (keyword && !keywordList.includes(keyword)) {
      setKeywordList(prev => [...prev, keyword]);
      return true;
    }
    return false;
  }, [keywordList]);

  // Remove a keyword from the list
  const removeKeyword = useCallback((keyword: string) => {
    setKeywordList(prev => prev.filter(k => k !== keyword));
  }, []);

  // Clear all keywords
  const clearKeywords = useCallback(() => {
    setKeywordList([]);
  }, []);

  // Clear match history
  const clearMatches = useCallback(() => {
    setMatches([]);
  }, []);

  // Check if a message contains any of the keywords
  const checkMessage = useCallback((message: any) => {
    if (!isEnabled || !message || !message.message || keywordList.length === 0) {
      return false;
    }

    const messageText = message.message.toString();
    
    for (const keyword of keywordList) {
      const searchText = caseSensitive ? messageText : messageText.toLowerCase();
      const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase();
      
      if (searchText.includes(searchKeyword)) {
        // Add to matches
        setMatches(prev => [{ message, keyword }, ...prev].slice(0, 100)); // Keep last 100 matches
        
        // Play notification sound
        play();
        
        // Call onMatch callback if provided
        if (options.onMatch) {
          options.onMatch(message, keyword);
        }
        
        return true;
      }
    }
    
    return false;
  }, [isEnabled, keywordList, caseSensitive, play, options.onMatch]);

  return {
    isEnabled,
    setIsEnabled,
    keywordList,
    setKeywordList,
    caseSensitive,
    setCaseSensitive,
    matches,
    addKeyword,
    removeKeyword,
    clearKeywords,
    clearMatches,
    checkMessage
  };
};