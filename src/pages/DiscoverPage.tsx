import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { authService } from "../services/auth.service";
import { userService, type UserMatch } from "../services/user.service";
import { chatService } from "../services/chat.service";
import { Search, MapPin } from "lucide-react";

const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const hasToken = !!authService.getAccessToken();
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<number | null>(null);

  const runSearch = useCallback(async (q: string) => {
    if (!hasToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userService.searchUsers(q);
      setResults(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [hasToken]);

  useEffect(() => {
    if (hasToken) runSearch("");
  }, [hasToken, runSearch]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(term);
    runSearch(term);
  };

  const handleConnect = async (userId: number) => {
    setConnecting(userId);
    try {
      const conv = await chatService.createConversation(String(userId));
      navigate(`/messages?conversationId=${conv.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setConnecting(null);
    }
  };

  if (!hasToken) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12 p-6 text-center">
          <p className="text-gray-600 mb-4">Sign in to discover members.</p>
          <Button onClick={() => navigate("/login")}>Go to login</Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 mt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
          <p className="text-gray-600 text-sm mt-1">
            Search people by name, skill, or profession.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Try “JavaScript”, a name, or a profession…"
              value={term}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTerm(e.target.value)
              }
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-3">
          {loading && (
            <p className="text-gray-500 text-sm">Loading people…</p>
          )}
          {!loading && results.length === 0 && (
            <Card className="p-6 text-center text-gray-600">
              No members match
              {query ? ` “${query}”.` : " yet."} Try another term.
            </Card>
          )}
          {!loading &&
            results.map((u) => (
              <Card key={u.id} className="p-4 flex flex-col sm:flex-row gap-4">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    u.name,
                  )}`}
                  alt=""
                  className="w-14 h-14 rounded-xl border border-gray-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-lg text-gray-900">
                    {u.name}
                  </h2>
                  <p className="text-sm text-gray-500">@{u.username}</p>
                  {u.profession && (
                    <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {u.profession}
                    </p>
                  )}
                  {u.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {u.skills.slice(0, 8).map((s) => (
                        <span
                          key={`${s.id}-${s.type}`}
                          className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800"
                        >
                          {s.name}
                          <span className="text-gray-400 ml-1">
                            {s.type === "TEACH" ? "teaches" : "learning"}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full sm:w-auto min-h-[44px]"
                    onClick={() => handleConnect(u.id)}
                    disabled={connecting === u.id}
                  >
                    {connecting === u.id ? "…" : "Message"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto min-h-[44px]"
                    onClick={() => navigate(`/profile/${u.id}`)}
                  >
                    Profile
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DiscoverPage;
