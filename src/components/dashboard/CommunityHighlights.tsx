import React, { useEffect, useMemo, useState } from "react";
import Card from "../ui/Card";
import { userService } from "../../services/user.service";

const CommunityHighlights: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await userService.getCommunityHighlights();
        if (!mounted) return;
        setData(res);
      } catch {
        if (!mounted) return;
        setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const topNames = useMemo(() => {
    const rows = data?.topLearnersThisMonth || [];
    if (!Array.isArray(rows) || rows.length === 0) return "—";
    return rows.map((r: any) => r.name).join(" · ");
  }, [data]);

  const mostTaught = useMemo(() => {
    const s = data?.mostTaughtSkill;
    if (!s?.name) return "—";
    return s.name;
  }, [data]);

  const challengeText = useMemo(() => {
    return data?.challenge?.subtitle || "—";
  }, [data]);

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="font-semibold">Community Highlights</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-100">
          <div className="font-semibold">Top exchangers (30 days)</div>
          <div className="mt-2 text-gray-700">
            {loading ? "Loading…" : topNames}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
          <div className="font-semibold">Most taught skill</div>
          <div className="mt-2 text-gray-700">{loading ? "Loading…" : mostTaught}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-100">
          <div className="font-semibold">This month</div>
          <div className="mt-2 text-gray-700">
            {loading ? "Loading…" : challengeText}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CommunityHighlights;
