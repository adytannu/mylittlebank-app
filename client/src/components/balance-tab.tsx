import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Check, Target, Undo2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function BalanceTab() {
  const { toast } = useToast();
  
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: chores = [] } = useQuery({
    queryKey: ["/api/chores"],
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["/api/goals"],
  });

  const completedChores = transactions.filter(t => t.type === "chore_completed").length;
  const activeGoals = goals.filter(g => !g.isCompleted).length;

  const undoTransactionMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      const response = await apiRequest("DELETE", `/api/transactions/${transactionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Success!",
        description: "Transaction undone successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string | number) => {
    return `$${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "chore_completed":
        return <Plus className="text-white text-sm" />;
      case "goal_allocation":
        return <Minus className="text-white text-sm" />;
      default:
        return <Plus className="text-white text-sm" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "chore_completed":
        return "bg-lime-400";
      case "goal_allocation":
        return "bg-orange-200";
      default:
        return "bg-ios-blue";
    }
  };

  const getTransactionTextColor = (type: string) => {
    switch (type) {
      case "chore_completed":
        return "text-lime-600";
      case "goal_allocation":
        return "text-orange-400";
      default:
        return "text-ios-blue";
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-pink-100 rounded-3xl p-8 shadow-2xl relative overflow-hidden border-4 border-white">

        <div className="text-center relative z-10">
          <p className="text-2xl font-black mb-4 text-gray-800 drop-shadow-lg">My Money</p>
          <h2 className="text-7xl font-black mb-6 drop-shadow-lg text-gray-800">
            {formatCurrency(user?.totalBalance || "0.00")}
          </h2>
          <div className="flex justify-center space-x-8 text-lg">
            <div className="text-center bg-white/60 rounded-2xl px-4 py-3 backdrop-blur-sm border-2 border-white">
              <p className="font-black text-gray-700 text-lg">Chores</p>
              <p className="text-3xl font-black text-gray-800">{completedChores}</p>
            </div>
            <div className="text-center bg-white/60 rounded-2xl px-4 py-3 backdrop-blur-sm border-2 border-white">
              <p className="font-black text-gray-700 text-lg">Goals</p>
              <p className="text-3xl font-black text-gray-800">{activeGoals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white rounded-2xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-ios-gray">
                <p>No activity yet</p>
                <p className="text-sm">Complete some chores to get started!</p>
              </div>
            ) : (
              transactions.map((transaction) => {
                const isRecent = Date.now() - new Date(transaction.createdAt).getTime() < 24 * 60 * 60 * 1000; // 24 hours
                return (
                  <div key={transaction.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-ios-gray">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`font-semibold ${getTransactionTextColor(transaction.type)}`}>
                        {transaction.type === "goal_allocation" ? "" : "+"}{formatCurrency(transaction.amount)}
                      </span>
                      {isRecent && (
                        <Button
                          onClick={() => undoTransactionMutation.mutate(transaction.id)}
                          disabled={undoTransactionMutation.isPending}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Undo2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-12 h-12 bg-ios-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="text-ios-green text-xl" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedChores}</p>
          <p className="text-sm text-ios-gray">Chores Done</p>
        </Card>
        <Card className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-12 h-12 bg-ios-orange bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="text-ios-orange text-xl" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeGoals}</p>
          <p className="text-sm text-ios-gray">Active Goals</p>
        </Card>
      </div>
    </div>
  );
}
