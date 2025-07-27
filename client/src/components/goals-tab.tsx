import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import MobileModal from "@/components/ui/mobile-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  description: z.string().optional(),
  targetAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Target amount must be a positive number",
  }),
});

const allocateSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
});

export default function GoalsTab() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const { toast } = useToast();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["/api/goals"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const goalForm = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      description: "",
      targetAmount: "",
    },
  });

  const allocateForm = useForm<z.infer<typeof allocateSchema>>({
    resolver: zodResolver(allocateSchema),
    defaultValues: {
      amount: "",
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof goalSchema>) => {
      const response = await apiRequest("POST", "/api/goals", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsAddModalOpen(false);
      goalForm.reset();
      toast({
        title: "Success!",
        description: "Goal created successfully",
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

  const allocateMutation = useMutation({
    mutationFn: async (data: { goalId: number; amount: string }) => {
      const response = await apiRequest("POST", "/api/goals/allocate", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setIsAllocateModalOpen(false);
      allocateForm.reset();
      toast({
        title: "Success!",
        description: "Money allocated successfully",
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

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: number) => {
      const response = await apiRequest("DELETE", `/api/goals/${goalId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Success!",
        description: "Goal deleted successfully",
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

  const getProgress = (current: string, target: string) => {
    const currentNum = parseFloat(current);
    const targetNum = parseFloat(target);
    return Math.min((currentNum / targetNum) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-pink-400";
    if (progress >= 50) return "bg-pink-300";
    return "bg-pink-200";
  };

  const handleAllocate = (goal: any) => {
    setSelectedGoal(goal);
    setIsAllocateModalOpen(true);
  };

  const onSubmitGoal = (data: z.infer<typeof goalSchema>) => {
    createGoalMutation.mutate(data);
  };

  const onSubmitAllocate = (data: z.infer<typeof allocateSchema>) => {
    if (selectedGoal) {
      allocateMutation.mutate({
        goalId: selectedGoal.id,
        amount: data.amount,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
            <div className="flex space-x-3">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Goal Button */}
      <Button
        onClick={() => setIsAddModalOpen(true)}
        className="w-full bg-pink-100 text-gray-800 rounded-3xl py-6 px-6 text-xl font-black shadow-2xl hover:shadow-3xl active:scale-95 transition-all border-4 border-white hover:bg-pink-200"
      >
        <Plus className="mr-3 text-2xl" />
        Add New Goal
      </Button>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardContent className="p-8 text-center text-ios-gray">
              <Target className="w-12 h-12 mx-auto mb-4 text-ios-gray" />
              <p className="text-lg font-medium">No goals yet</p>
              <p className="text-sm">Create your first savings goal to get started!</p>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = getProgress(goal.currentAmount, goal.targetAmount);
            const progressColor = getProgressColor(progress);
            
            return (
              <Card key={goal.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{goal.name}</h3>
                    <span className="text-ios-blue font-semibold">
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-ios-gray mb-4">{goal.description}</p>
                  )}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-ios-gray mb-2">
                      <span>Progress</span>
                      <span>
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${progressColor}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleAllocate(goal)}
                      className="flex-1 bg-pink-100 text-gray-800 rounded-xl py-3 px-4 hover:bg-pink-200 active:scale-95 transition-all border-2 border-white"
                      disabled={parseFloat(user?.totalBalance || "0") <= 0}
                    >
                      <Plus className="mr-2" />
                      Add Money
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
                        >
                          <Trash2 className="text-ios-red" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{goal.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteGoalMutation.mutate(goal.id)}
                            className="bg-ios-red hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Goal Modal */}
      <MobileModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Goal"
      >
        <Form {...goalForm}>
          <form onSubmit={goalForm.handleSubmit(onSubmitGoal)} className="space-y-4">
            <FormField
              control={goalForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Goal Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What do you want to save for?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ios-blue focus:border-ios-blue"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={goalForm.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Target Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ios-blue focus:border-ios-blue"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={goalForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Tell us more about your goal..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ios-blue focus:border-ios-blue"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createGoalMutation.isPending}
                className="flex-1 py-3 px-4 bg-ios-blue text-white rounded-xl hover:bg-blue-600"
              >
                {createGoalMutation.isPending ? "Adding..." : "Add Goal"}
              </Button>
            </div>
          </form>
        </Form>
      </MobileModal>

      {/* Allocate Money Modal */}
      <MobileModal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title="Add Money to Goal"
      >
        <div className="text-center mb-6">
          <p className="text-ios-gray mb-2">Available Balance</p>
          <p className="text-3xl font-bold text-ios-green">
            {formatCurrency(user?.totalBalance || "0.00")}
          </p>
        </div>
        <Form {...allocateForm}>
          <form onSubmit={allocateForm.handleSubmit(onSubmitAllocate)} className="space-y-4">
            <FormField
              control={allocateForm.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Amount to Add</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ios-blue focus:border-ios-blue"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAllocateModalOpen(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={allocateMutation.isPending}
                className="flex-1 py-3 px-4 bg-ios-green text-white rounded-xl hover:bg-green-600"
              >
                {allocateMutation.isPending ? "Adding..." : "Add Money"}
              </Button>
            </div>
          </form>
        </Form>
      </MobileModal>
    </div>
  );
}
