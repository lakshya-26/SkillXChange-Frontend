import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import RecommendedMatchesList from "../components/dashboard/RecommendedMatchesList";
import { authService } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const hasToken = !!authService.getAccessToken();

  if (!hasToken) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12 p-6 text-center">
          <p className="text-gray-600 mb-4">Sign in to see your matches.</p>
          <Button onClick={() => navigate("/login")}>Go to login</Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 mt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
          <p className="text-gray-600 text-sm mt-1">
            Skill-based suggestions from your teach / learn profile.
          </p>
        </div>
        <RecommendedMatchesList layout="grid" />
      </div>
    </DashboardLayout>
  );
};

export default MatchesPage;
