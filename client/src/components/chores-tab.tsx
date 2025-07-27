import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Check, Fan, Car, Dog, Utensils, Music, Shirt, Flower, BookOpen, Home, Baby, Coffee, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MobileModal from "@/components/ui/mobile-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const choreSchema = z.object({
  name: z.string().min(1, "Chore name is required"),
  description: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Payment amount must be a positive number",
  }),
  icon: z.string().optional(),
});

const choreIcons = [
  { value: "broom", label: "Cleaning", icon: Fan, color: "bg-ios-cyan bg-opacity-20 text-ios-cyan" },
  { value: "car", label: "Car Wash", icon: Car, color: "bg-ios-green bg-opacity-20 text-ios-green" },
  { value: "dog", label: "Pet Care", icon: Dog, color: "bg-ios-purple bg-opacity-20 text-ios-purple" },
  { value: "utensils", label: "Kitchen", icon: Utensils, color: "bg-ios-orange bg-opacity-20 text-ios-orange" },
  { value: "music", label: "Music Practice", icon: Music, color: "bg-pink-100 text-pink-600" },
  { value: "laundry", label: "Laundry", icon: Shirt, color: "bg-blue-100 text-blue-600" },
  { value: "plants", label: "Plant Care", icon: Flower, color: "bg-green-100 text-green-600" },
  { value: "study", label: "Study Time", icon: BookOpen, color: "bg-purple-100 text-purple-600" },
  { value: "house", label: "House Cleaning", icon: Home, color: "bg-gray-100 text-gray-600" },
  { value: "babysit", label: "Babysitting", icon: Baby, color: "bg-yellow-100 text-yellow-600" },
  { value: "coffee", label: "Dishwashing", icon: Coffee, color: "bg-orange-100 text-orange-600" },
  { value: "vacuum", label: "Vacuuming", icon: Zap, color: "bg-indigo-100 text-indigo-600" },
];

export default function ChoresTab() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedChore, setSelectedChore] = useState<any>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [finalResetConfirmOpen, setFinalResetConfirmOpen] = useState(false);
  const { toast } = useToast();

  const { data: chores = [], isLoading } = useQuery({
    queryKey: ["/api/chores"],
  });

  const choreForm = useForm<z.infer<typeof choreSchema>>({
    resolver: zodResolver(choreSchema),
    defaultValues: {
      name: "",
      description: "",
      amount: "",
      icon: "broom",
    },
  });

  const createChoreMutation = useMutation({
    mutationFn: async (data: z.infer<typeof choreSchema>) => {
      const response = await apiRequest("POST", "/api/chores", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chores"] });
      setIsAddModalOpen(false);
      choreForm.reset();
      toast({
        title: "Success!",
        description: "Chore created successfully",
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

  const updateChoreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof choreSchema> }) => {
      const response = await apiRequest("PATCH", `/api/chores/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chores"] });
      setIsEditModalOpen(false);
      setSelectedChore(null);
      choreForm.reset();
      toast({
        title: "Success!",
        description: "Chore updated successfully",
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

  const deleteChoreMutation = useMutation({
    mutationFn: async (choreId: number) => {
      const response = await apiRequest("DELETE", `/api/chores/${choreId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chores"] });
      toast({
        title: "Success!",
        description: "Chore deleted successfully",
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

  const completeResetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reset", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setResetConfirmOpen(false);
      setFinalResetConfirmOpen(false);
      toast({
        title: "Complete Reset Successful!",
        description: "All data has been cleared and balance reset to $0.00",
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

  const claimChoreMutation = useMutation({
    mutationFn: async (choreId: number) => {
      const response = await apiRequest("POST", `/api/chores/${choreId}/claim`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Great Job!",
        description: `You've earned ${data.transaction.amount} for completing your chore!`,
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

  const getChoreIcon = (iconName: string) => {
    const iconConfig = choreIcons.find(icon => icon.value === iconName) || choreIcons[0];
    return iconConfig;
  };

  const handleEdit = (chore: any) => {
    setSelectedChore(chore);
    choreForm.reset({
      name: chore.name,
      description: chore.description || "",
      amount: chore.amount,
      icon: chore.icon || "broom",
    });
    setIsEditModalOpen(true);
  };

  const onSubmitChore = (data: z.infer<typeof choreSchema>) => {
    if (selectedChore) {
      updateChoreMutation.mutate({ id: selectedChore.id, data });
    } else {
      createChoreMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
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
      {/* Add Chore Button */}
      <Button
        onClick={() => setIsAddModalOpen(true)}
        className="w-full bg-pink-100 text-gray-800 rounded-3xl py-6 px-6 text-xl font-black shadow-2xl hover:shadow-3xl active:scale-95 transition-all border-4 border-white hover:bg-pink-200"
      >
        <Plus className="mr-3 text-2xl" />
        Add New Chore
      </Button>

      {/* Chores List */}
      <div className="space-y-4">
        {chores.length === 0 ? (
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardContent className="p-8 text-center text-ios-gray">
              <Fan className="w-12 h-12 mx-auto mb-4 text-ios-gray" />
              <p className="text-lg font-medium">No chores yet</p>
              <p className="text-sm">Add your first chore to start earning money!</p>
            </CardContent>
          </Card>
        ) : (
          chores.map((chore) => {
            const iconConfig = getChoreIcon(chore.icon);
            const Icon = iconConfig.icon;
            
            return (
              <Card key={chore.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconConfig.color}`}>
                        <Icon className="text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{chore.name}</h3>
                        {chore.description && (
                          <p className="text-sm text-ios-gray">{chore.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-ios-green">
                      {formatCurrency(chore.amount)}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => claimChoreMutation.mutate(chore.id)}
                      disabled={claimChoreMutation.isPending}
                      className="flex-1 bg-lime-400 text-white rounded-xl py-3 px-4 hover:bg-lime-500 active:scale-95 transition-all"
                    >
                      <Check className="mr-2" />
                      {claimChoreMutation.isPending ? "Claiming..." : "Claim Payment"}
                    </Button>
                    <Button
                      onClick={() => handleEdit(chore)}
                      variant="outline"
                      className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
                    >
                      <Edit className="text-ios-gray" />
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
                          <AlertDialogTitle>Delete Chore</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{chore.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteChoreMutation.mutate(chore.id)}
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

      {/* Add/Edit Chore Modal */}
      <MobileModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedChore(null);
          choreForm.reset();
        }}
        title={selectedChore ? "Edit Chore" : "Add New Chore"}
      >
        <Form {...choreForm}>
          <form onSubmit={choreForm.handleSubmit(onSubmitChore)} className="space-y-4">
            <FormField
              control={choreForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Chore Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What chore needs to be done?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ios-blue focus:border-ios-blue"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={choreForm.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Payment Amount</FormLabel>
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
              control={choreForm.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Icon</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ios-blue focus:border-ios-blue">
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {choreIcons.map((icon) => {
                        const Icon = icon.icon;
                        return (
                          <SelectItem key={icon.value} value={icon.value}>
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4" />
                              <span>{icon.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={choreForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Describe what needs to be done..."
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
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedChore(null);
                  choreForm.reset();
                }}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createChoreMutation.isPending || updateChoreMutation.isPending}
                className="flex-1 py-3 px-4 bg-ios-green text-white rounded-xl hover:bg-green-600"
              >
                {createChoreMutation.isPending || updateChoreMutation.isPending
                  ? "Saving..."
                  : selectedChore
                  ? "Update Chore"
                  : "Add Chore"}
              </Button>
            </div>
          </form>
        </Form>
      </MobileModal>

      {/* Complete Reset Section */}
      <Card className="bg-red-50 border-red-200 rounded-2xl shadow-sm mt-8">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="text-red-500 w-6 h-6" />
            <h3 className="text-lg font-semibold text-red-700">Danger Zone</h3>
          </div>
          <p className="text-sm text-red-600 mb-4">
            Complete reset will permanently delete all chores, goals, transactions, and reset your balance to $0.00. This action cannot be undone.
          </p>
          <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-2 border-red-400 text-red-700 hover:bg-red-100 rounded-xl py-3 font-semibold"
              >
                🗑️ Complete Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete ALL your data:
                  <br />• All chores and payment history
                  <br />• All goals and progress
                  <br />• All transaction records
                  <br />• Reset balance to $0.00
                  <br /><br />This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setResetConfirmOpen(false);
                    setFinalResetConfirmOpen(true);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  I understand, continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Final confirmation dialog */}
          <AlertDialog open={finalResetConfirmOpen} onOpenChange={setFinalResetConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600">Final Confirmation</AlertDialogTitle>
                <AlertDialogDescription>
                  Type "RESET" below to confirm you want to permanently delete all data and reset your balance.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => completeResetMutation.mutate()}
                  disabled={completeResetMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {completeResetMutation.isPending ? "Resetting..." : "RESET ALL DATA"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
