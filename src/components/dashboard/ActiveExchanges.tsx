import React from "react";
import Card from "../ui/Card";

type Exchange = {
  id: string;
  with: string;
  topic: string;
  status: "Ongoing" | "Pending" | "Completed";
  time: string;
};

const exchanges: Exchange[] = [
  {
    id: "e1",
    with: "Akshat",
    topic: "Design Basics",
    status: "Ongoing",
    time: "Today, 6 PM",
  },
  {
    id: "e2",
    with: "Priya",
    topic: "Spanish A1",
    status: "Pending",
    time: "Awaiting confirm",
  },
  {
    id: "e3",
    with: "Rahul",
    topic: "Photography 101",
    status: "Completed",
    time: "Yesterday",
  },
];

const StatusChip: React.FC<{ status: Exchange["status"] }> = ({ status }) => {
  const map = {
    Ongoing: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-800",
    Completed: "bg-blue-100 text-blue-800",
  } as const;
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status]}`}
    >
      {status}
    </span>
  );
};

const ActiveExchanges: React.FC = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Active Exchanges</h3>
        <button className="text-sm text-blue-600 hover:underline">
          View all
        </button>
      </div>
      <div className="space-y-3">
        {exchanges.map((ex) => (
          <div
            key={ex.id}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
          >
            <div>
              <div className="font-medium">{ex.topic}</div>
              <div className="text-sm text-gray-600">
                with {ex.with} • {ex.time}
              </div>
            </div>
            <StatusChip status={ex.status} />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActiveExchanges;
