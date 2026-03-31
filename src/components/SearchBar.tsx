import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search } from "lucide-react";
import { searchIndex } from "@/data/search/searchIndex";

// Add more keywords and routes as needed for navigation
const searchRoutes = [
  { keyword: "dashboard", path: "/wellness-dashboard" },
  { keyword: "wellness", path: "/wellness-dashboard" },
  { keyword: "wellness goals", path: "/wellness-dashboard" },
  { keyword: "assessment", path: "/assessment" },
  { keyword: "resources", path: "/resources" },
  { keyword: "goals", path: "/wellness-dashboard" },
  { keyword: "journal", path: "/wellness-dashboard" },
  { keyword: "forum", path: "/wellness-dashboard" },
  { keyword: "profile", path: "/profile-settings" },
  { keyword: "school", path: "/school-dashboard" },
  { keyword: "student", path: "/student-dashboard" },
];

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [show, setShow] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [results, setResults] = useState<{ text: string; route: string }[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    }

    // Add event listener when search is shown
    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show]);

  // Enhanced fuzzy search with better matching
  function getSearchScore(query: string, text: string): number {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    // Exact match
    if (textLower === queryLower) return 100;

    // Starts with query
    if (textLower.startsWith(queryLower)) return 90;

    // Contains query as whole word
    if (new RegExp(`\\b${queryLower}\\b`).test(textLower)) return 80;

    // Contains query as substring
    if (textLower.includes(queryLower)) return 70;

    // Split into words and check for partial matches
    const queryWords = queryLower.split(/\s+/);
    const textWords = textLower.split(/\s+/);

    // Count how many query words appear in text
    const matchingWords = queryWords.filter(qw =>
      textWords.some(tw => tw.includes(qw) || qw.includes(tw))
    );

    if (matchingWords.length > 0) {
      return 50 + (matchingWords.length / queryWords.length) * 30;
    }

    // No match
    return 0;
  }

  // Enhanced highlight function that shows context around matches
  function highlight(text: string, query: string) {
    if (!query) return text;

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const matchIndex = textLower.indexOf(queryLower);

    if (matchIndex === -1) return text;

    // Show some context around the match
    const start = Math.max(0, matchIndex - 20);
    const end = Math.min(text.length, matchIndex + query.length + 40);
    let result = '';

    if (start > 0) result += '...';

    const before = text.substring(start, matchIndex);
    const match = text.substring(matchIndex, matchIndex + query.length);
    const after = text.substring(matchIndex + query.length, end);

    if (end < text.length) result += after + '...';

    return (
      <>
        {before}
        <mark className="bg-yellow-100 px-0.5 rounded">
          {match}
        </mark>
        {after}
        {end < text.length ? '...' : ''}
      </>
    );
  }

  // Search across all content with scoring
  function searchContent(q: string) {
    if (!q.trim()) return [];

    const query = q.toLowerCase();

    // First, find all matching helplines (they contain 'helpline' in text or are in the helplines section)
    const helplineResults = searchIndex
      .filter(item =>
        item.text.toLowerCase().includes('helpline') ||
        item.text.toLowerCase().includes('support') ||
        item.text.match(/\d{3,}/) // Contains a phone number
      )
      .map(item => ({
        ...item,
        score: getSearchScore(query, item.text) * 1.5, // Boost helpline scores
        isHelpline: true
      }));

    // Then find all other matching content
    const otherResults = searchIndex
      .filter(item =>
        !helplineResults.some(h => h.text === item.text) // Don't include helplines again
      )
      .map(item => ({
        ...item,
        score: getSearchScore(query, item.text),
        isHelpline: false
      }));

    // Combine and sort results
    const allResults = [...helplineResults, ...otherResults]
      .filter(item => item.score > 0) // Only include matches with some score
      .sort((a, b) => {
        // First sort by whether it's a helpline (helplines first)
        if (a.isHelpline !== b.isHelpline) {
          return a.isHelpline ? -1 : 1;
        }
        // Then by score
        return b.score - a.score;
      })
      .slice(0, 15); // Show more results since we have more content now

    // Add route-based matches if no good content matches found
    if (allResults.length === 0) {
      searchRoutes.forEach(route => {
        const score = getSearchScore(query, route.keyword);
        if (score > 50) {
          allResults.push({
            text: `Go to ${route.keyword}`,
            route: route.path,
            score: score,
            isHelpline: false
          });
        }
      });
    }

    return allResults;
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setNotFound(false);
    const q = query.toLowerCase().trim();
    const contentResults = searchContent(q);
    setResults(contentResults);
    if (contentResults.length > 0) {
      setShow(true);
      setNotFound(false);
      // Optionally, navigate to first result on enter:
      // navigate(contentResults[0].route);
    } else {
      // Fallback to route search using our scoring system
      let bestMatch: { score: number; route: { path: string; keyword: string } | null } = {
        score: 0,
        route: null
      };

      searchRoutes.forEach(route => {
        if (route.keyword) {
          const score = getSearchScore(q, route.keyword);
          if (score > bestMatch.score) {
            bestMatch = { score, route };
          }
        }
      });

      const match = bestMatch.score > 50 ? bestMatch.route : null;
      if (match) {
        navigate(match.path);
        setShow(false);
        setQuery("");
      } else {
        setNotFound(true);
      }
    }
  };

  // Debounced search as user types
  React.useEffect(() => {
    if (!show) {
      setResults([]);
      return;
    }

    const handler = setTimeout(() => {
      if (query.trim()) {
        setResults(searchContent(query));
      } else {
        setResults([]);
      }
    }, 100); // Small delay to avoid searching on every keystroke

    return () => clearTimeout(handler);
  }, [query, show]);

  return (
    <div className="relative z-50" ref={searchRef}>
      <div className="flex items-center">
        <button
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none relative z-50"
          aria-label="Search"
          onClick={() => setShow((s) => !s)}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      {show && (
        <div className="fixed md:absolute right-0 md:right-0 top-12 md:top-10 bg-transparent z-[100] w-[90vw] max-w-md md:w-80">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center bg-white rounded-md border border-gray-300 shadow-sm w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 pr-8 text-sm border-0 focus:outline-none focus:ring-0 rounded-md"
                autoFocus
                onKeyDown={(e) => e.stopPropagation()}
              />
              <button
                type="submit"
                className="absolute right-2 p-1 text-gray-400 hover:text-gray-600"
                title="Search"
                aria-label="Search"
                onClick={(e) => e.stopPropagation()}
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
          {results.length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto divide-y bg-white rounded-b-md shadow-lg border-t-0 border border-gray-200 -mt-px">
              {results.map((r, i) => (
                <Link
                  to={r.route}
                  key={i}
                  className="block px-3 py-2 text-sm text-gray-800 hover:bg-teal-50 transition-colors"
                  onClick={() => setShow(false)}
                >
                  <div className="font-medium text-blue-600">
                    {r.text.length > 60 ? `${r.text.substring(0, 60)}...` : r.text}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {highlight(r.text, query)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {r.route.replace(/^\//, '').replace(/\//g, ' › ')}
                  </div>
                </Link>
              ))}
            </div>
          )}
          {notFound && results.length === 0 && (
            <div className="text-red-500 text-xs rounded shadow p-2 mt-2">No matching content found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
