import React from "react";
import {
  Sparkles,
  Star,
  PlusCircle,
  Search,
  MessageSquare,
} from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

const WelcomeBanner: React.FC = () => {
  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              Hey, Lakshya! Ready to learn something new today?
            </h2>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 shadow text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">Reputation</span>
              <span className="text-gray-500">•</span>
              <span>1,240 pts</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm">
            <PlusCircle className="w-4 h-4 mr-2" /> Add New Skill
          </Button>
          <Button variant="secondary" size="sm">
            <Search className="w-4 h-4 mr-2" /> Find a Match
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" /> Open Messages
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WelcomeBanner;
