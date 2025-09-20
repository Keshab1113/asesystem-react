import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Save, Plus, X, Clock, Users, Settings } from "lucide-react";
import useToast from "../../hooks/ToastContext";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../components/ui/popover";
import { Calendar } from "../../components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export function QuizFormModal({ quiz, open, onOpenChange, onSave }) {
  const { toast } = useToast();
  const isEditing = !!quiz;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: quiz?.name || "",
    description: "",
    subject: quiz?.subject || "",
    difficulty: quiz?.difficulty || "medium",
    timeLimit: "30",
    passingScore: "70",
    maxAttempts: "3",
  maxQuestions: quiz?.questionCount || 0, // <-- new field
    randomizeQuestions: true,
    showResults: true,
    allowReview: true,
    isPublic: false,
    tags: [],
  });

  // Reset form data when quiz prop changes
  useEffect(() => {
    if (quiz) {
      setFormData({
        name: quiz.name || "",
        description: quiz.description || "",
        subject: quiz.subject || "",
        difficulty: quiz.difficulty || "medium",
        timeLimit: quiz.timeLimit || "30",
        passingScore: quiz.passingScore || "70",
        maxAttempts: quiz.maxAttempts || "3",
        maxQuestions: quiz.questionCount || 0,
        randomizeQuestions: quiz.randomizeQuestions ?? true,
        showResults: quiz.showResults ?? true,
        allowReview: quiz.allowReview ?? true,
        isPublic: quiz.isPublic ?? false,
        tags: quiz.tags || [],
        scheduleStartDate: quiz.scheduleStartDate || "",
        scheduleStartTime: quiz.scheduleStartTime || "",
        scheduleEndDate: quiz.scheduleEndDate || "",
        scheduleEndTime: quiz.scheduleEndTime || "",
      });
    } else {
      // Reset to default values for new quiz
      setFormData({
        name: "",
        description: "",
        subject: "",
        difficulty: "medium",
        timeLimit: "30",
        passingScore: "70",
        maxAttempts: "3",
        maxQuestions: 0,
        randomizeQuestions: true,
        showResults: true,
        allowReview: true,
        isPublic: false,
        tags: [],
        scheduleStartDate: "",
        scheduleStartTime: "",
        scheduleEndDate: "",
        scheduleEndTime: "",
      });
    }
  }, [quiz]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      // Reset form to default values when modal closes
      if (quiz) {
        setFormData({
          name: quiz.name || "",
          description: quiz.description || "",
          subject: quiz.subject || "",
          difficulty: quiz.difficulty || "medium",
          timeLimit: quiz.timeLimit || "30",
          passingScore: quiz.passingScore || "70",
          maxAttempts: quiz.maxAttempts || "3",
          maxQuestions: quiz.questionCount || 0,
          randomizeQuestions: quiz.randomizeQuestions ?? true,
          showResults: quiz.showResults ?? true,
          allowReview: quiz.allowReview ?? true,
          isPublic: quiz.isPublic ?? false,
          tags: quiz.tags || [],
          scheduleStartDate: quiz.scheduleStartDate || "",
          scheduleStartTime: quiz.scheduleStartTime || "",
          scheduleEndDate: quiz.scheduleEndDate || "",
          scheduleEndTime: quiz.scheduleEndTime || "",
        });
      } else {
        setFormData({
          name: "",
          description: "",
          subject: "",
          difficulty: "medium",
          timeLimit: "30",
          passingScore: "70",
          maxAttempts: "3",
          maxQuestions: 0,
          randomizeQuestions: true,
          showResults: true,
          allowReview: true,
          isPublic: false,
          tags: [],
          scheduleStartDate: "",
          scheduleStartTime: "",
          scheduleEndDate: "",
          scheduleEndTime: "",
        });
      }
    }
  }, [open, quiz]);

  const [newTag, setNewTag] = useState("");

  const handleSave = async () => {
    setLoading(true);

    const quizData = {
      name: formData.name,
      description: formData.description,
      subject_id: formData.subject || null,
      difficulty_level: formData.difficulty || "medium",
      timeLimit: formData.timeLimit,
      passingScore: formData.passingScore,
      maxAttempts: formData.maxAttempts,
      maxQuestions: formData.maxQuestions || 0,
      scheduleStartDate: formData.scheduleStartDate || null,
      scheduleStartTime: formData.scheduleStartTime || null,
      scheduleEndDate: formData.scheduleEndDate || null,
      scheduleEndTime: formData.scheduleEndTime || null,
    };
    try {
      if (isEditing && quiz?.id) {
        console.log("Editing quiz with id:", quiz.id);
        // Update existing quiz
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/edit/${
            quiz.id
          }`,
          quizData
        );
        toast({
          title: "Quiz Updated",
          description: `Quiz "${quizData.name}" has been updated successfully.`,
          variant: "success",
        });
      } else {
        // Create new quiz
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/create`,
          quizData
        );
        toast({
          title: "Quiz Created",
          description: `Quiz "${formData.name}" has been created successfully.`,
          variant: "success",
        });
      }

      // Call onSave callback to update frontend state if needed
      onSave({
        ...quizData,
        id: quiz?.id,
        isActive: quiz?.isActive ?? true, // preserve active state
        questionCount: quiz?.questionCount || 0, // preserve question count
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save quiz",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };
 

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <Settings className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            {isEditing ? "Schedule Assignment" : "Create New Quiz"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modify the Assignment settings and configuration"
              : "Set up a new Assignment with questions and settings"}
          </DialogDescription>

          {isEditing && quiz?.name && (
            <div className="text-sm text-muted-foreground mt-2 px-1">
              Selected Quiz: <span className="font-medium">{quiz.name}</span>
            </div>
          )}
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
          
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-name">Quiz Name *</Label>
                <Input
                  id="quiz-name"
                  placeholder="Enter quiz name..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <Input
                  id="time-limit"
                  type="number"
                  placeholder="30"
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, timeLimit: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {/* Existing fields */}

              <div className="flex   gap-6">
                {/* Schedule Start */}

                <div className="space-y-2">
                  <Label htmlFor="schedule-start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !formData.scheduleStartDate && "text-muted-foreground"
                        }`}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduleStartDate
                          ? format(new Date(formData.scheduleStartDate), "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          formData.scheduleStartDate
                            ? new Date(formData.scheduleStartDate)
                            : undefined
                        }
                        onSelect={(date) =>
                          setFormData({
                            ...formData,
                            scheduleStartDate: date
                              ? date.toLocaleDateString("en-CA") // keeps local date, format: YYYY-MM-DD
                              : "",
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-start-time">Start Time</Label>
                  <Input
                    id="schedule-start-time"
                    type="time"
                    value={formData.scheduleStartTime || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduleStartTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex   gap-6">
                {/* Schedule End */}
                <div className="space-y-2  ">
                  <Label htmlFor="schedule-end-date">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !formData.scheduleEndDate && "text-muted-foreground"
                        }`}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduleEndDate
                          ? format(new Date(formData.scheduleEndDate), "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          formData.scheduleEndDate
                            ? new Date(formData.scheduleEndDate)
                            : undefined
                        }
                        disabled={{
                          before: formData.scheduleStartDate
                            ? new Date(formData.scheduleStartDate)
                            : undefined,
                        }}
                        onSelect={(date) =>
                          setFormData({
                            ...formData,
                            scheduleEndDate: date
                              ? date.toLocaleDateString("en-CA")
                              : "",
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2 ">
                  <Label htmlFor="schedule-end-time ">End Time</Label>
                  <Input
                    id="schedule-end-time"
                    type="time"
                    className="cursor-pointer"
                    value={formData.scheduleEndTime || ""}
                    onChange={(e) => {
                      const newEndTime = e.target.value;
                      const {
                        scheduleStartDate,
                        scheduleEndDate,
                        scheduleStartTime,
                      } = formData;

                      // Only compare if start & end are on the same date
                      if (
                        scheduleStartDate &&
                        scheduleEndDate &&
                        scheduleStartDate === scheduleEndDate &&
                        scheduleStartTime &&
                        newEndTime <= scheduleStartTime
                      ) {
                        toast({
                          title: "Error",
                          description:
                            error.response?.data?.message ||
                            "End time must be after start time on the same day",
                          variant: "error",
                        });
                        // alert("End time must be after start time on the same day");
                        return; // ❌ prevent invalid value
                      }

                      // ✅ valid case → update state
                      setFormData({
                        ...formData,
                        scheduleEndTime: newEndTime,
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Quiz Behavior
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passing-score">Passing Score (%)</Label>
                  <Input
                    id="passing-score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData({ ...formData, passingScore: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Maximum Attempts</Label>
                  <Select
                    value={formData.maxAttempts}
                    onValueChange={(value) =>
                      setFormData({ ...formData, maxAttempts: value })
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 attempt</SelectItem>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
  <Label htmlFor="max-questions">Maximum Questions</Label>
  <Input
    id="max-questions"
    type="number"
    min="1"
    max={quiz?.questionCount || 1} // <-- cannot exceed number of questions
    value={formData.maxQuestions}
    onChange={(e) => {
      const value = Math.min(Number(e.target.value), quiz?.questionCount || 1);
      setFormData({ ...formData, maxQuestions: value });
    }}
    placeholder={`Up to ${quiz?.questionCount || 1}`}
  />
  {quiz?.questionCount && (
    <p className="text-xs text-gray-500">
      Max {quiz.questionCount} questions allowed.
    </p>
  )}
</div>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <svg
                className="animate-spin h-4 w-4 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? "Saving..." : isEditing ? "Update Quiz" : "Create Quiz"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

// return (
//   <Dialog open={open} onOpenChange={onOpenChange}>
//     <DialogContent className="max-w-5xl h-[90vh] flex flex-col bg-white dark:bg-slate-900">
//       <DialogHeader className="pb-6 border-b border-slate-200 dark:border-slate-700">
//         <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
//           <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
//             {isEditing ? (
//               <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//             ) : (
//               <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//             )}
//           </div>
//           {isEditing ? "Edit Quiz" : "Create New Quiz"}
//         </DialogTitle>
//         <DialogDescription className="text-slate-600 dark:text-slate-400">
//           {isEditing
//             ? "Modify the quiz settings and configuration"
//             : "Set up a new quiz with questions and settings"}
//         </DialogDescription>

//         {isEditing && quiz?.name && (
//           <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
//             <div className="text-sm text-slate-600 dark:text-slate-400">
//               Selected Quiz: <span className="font-medium text-slate-900 dark:text-slate-100">{quiz.name}</span>
//             </div>
//           </div>
//         )}
//       </DialogHeader>

//       <div className="flex-1 overflow-y-auto px-6 pb-6">
//         <Tabs defaultValue="basic" className="w-full mt-6">
//           <TabsList className="grid w-full grid-cols-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
//             <TabsTrigger 
//               value="basic" 
//               className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
//             >
//               Basic Info
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="basic" className="space-y-6 mt-6">
//             {/* Basic Info - Full Width */}
//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="quiz-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                     Quiz Name *
//                   </Label>
//                   <Input
//                     id="quiz-name"
//                     placeholder="Enter quiz name..."
//                     value={formData.name}
//                     onChange={(e) =>
//                       setFormData({ ...formData, name: e.target.value })
//                     }
//                     className="h-11 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="time-limit" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                     Time Limit (minutes)
//                   </Label>
//                   <Input
//                     id="time-limit"
//                     type="number"
//                     placeholder="30"
//                     value={formData.timeLimit}
//                     onChange={(e) =>
//                       setFormData({ ...formData, timeLimit: e.target.value })
//                     }
//                     className="h-11 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
//                   />
//                 </div>
//               </div>
//             </div>

//           {/* Schedule Section */}
//           <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
//             <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Schedule</h3>
            
//             <div className="grid grid-cols-2 gap-4">
//               {/* Start Date/Time */}
//               <div className="space-y-2">
//                 <Label htmlFor="schedule-start-date" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                   Start Date
//                 </Label>
//                 <Popover>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className={`w-full h-11 justify-start text-left font-normal ${
//                         !formData.scheduleStartDate && "text-muted-foreground"
//                       }`}>
//                       <CalendarIcon className="mr-2 h-4 w-4" />
//                       {formData.scheduleStartDate
//                         ? format(new Date(formData.scheduleStartDate), "PPP")
//                         : "Pick a date"}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0" align="start">
//                     <Calendar
//                       mode="single"
//                       selected={
//                         formData.scheduleStartDate
//                           ? new Date(formData.scheduleStartDate)
//                           : undefined
//                       }
//                       onSelect={(date) =>
//                         setFormData({
//                           ...formData,
//                           scheduleStartDate: date
//                             ? date.toLocaleDateString("en-CA")
//                             : "",
//                         })
//                       }
//                       initialFocus
//                     />
//                   </PopoverContent>
//                 </Popover>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="schedule-start-time" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                   Start Time
//                 </Label>
//                 <Input
//                   id="schedule-start-time"
//                   type="time"
//                   value={formData.scheduleStartTime || ""}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       scheduleStartTime: e.target.value,
//                     })
//                   }
//                   className="h-11 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
//                 />
//               </div>

//               {/* End Date/Time */}
//               <div className="space-y-2">
//                 <Label htmlFor="schedule-end-date" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                   End Date
//                 </Label>
//                 <Popover>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className={`w-full h-11 justify-start text-left font-normal ${
//                         !formData.scheduleEndDate && "text-muted-foreground"
//                       }`}>
//                       <CalendarIcon className="mr-2 h-4 w-4" />
//                       {formData.scheduleEndDate
//                         ? format(new Date(formData.scheduleEndDate), "PPP")
//                         : "Pick a date"}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-[280px] p-0" align="start">
//                     <Calendar
//                       mode="single"
//                       selected={
//                         formData.scheduleEndDate
//                           ? new Date(formData.scheduleEndDate)
//                           : undefined
//                       }
//                       disabled={{
//                         before: formData.scheduleStartDate
//                           ? new Date(formData.scheduleStartDate)
//                           : undefined,
//                       }}
//                       onSelect={(date) =>
//                         setFormData({
//                           ...formData,
//                           scheduleEndDate: date
//                             ? date.toLocaleDateString("en-CA")
//                             : "",
//                         })
//                       }
//                       initialFocus
//                     />
//                   </PopoverContent>
//                 </Popover>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="schedule-end-time" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                   End Time
//                 </Label>
//                 <Input
//                   id="schedule-end-time"
//                   type="time"
//                   className="h-11 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg cursor-pointer"
//                   value={formData.scheduleEndTime || ""}
//                   onChange={(e) => {
//                     const newEndTime = e.target.value;
//                     const {
//                       scheduleStartDate,
//                       scheduleEndDate,
//                       scheduleStartTime,
//                     } = formData;

//                     if (
//                       scheduleStartDate &&
//                       scheduleEndDate &&
//                       scheduleStartDate === scheduleEndDate &&
//                       scheduleStartTime &&
//                       newEndTime <= scheduleStartTime
//                     ) {
//                       toast({
//                         title: "Error",
//                         description:
//                           error.response?.data?.message ||
//                           "End time must be after start time on the same day",
//                         variant: "error",
//                       });
//                       return;
//                     }

//                     setFormData({
//                       ...formData,
//                       scheduleEndTime: newEndTime,
//                     });
//                   }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Quiz Behavior Section */}
//           <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
//             <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
//               <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//               Quiz Behavior
//             </h3>

//             <div className="grid grid-cols-3 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="passing-score" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                   Passing Score (%)
//                 </Label>
//                 <Input
//                   id="passing-score"
//                   type="number"
//                   min="0"
//                   max="100"
//                   value={formData.passingScore}
//                   onChange={(e) =>
//                     setFormData({ ...formData, passingScore: e.target.value })
//                   }
//                   className="h-11 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="max-attempts" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                   Maximum Attempts
//                 </Label>
//                 <Select
//                   value={formData.maxAttempts}
//                   onValueChange={(value) =>
//                     setFormData({ ...formData, maxAttempts: value })
//                   }>
//                   <SelectTrigger className="h-11 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="1">1 attempt</SelectItem>
//                     <SelectItem value="3">3 attempts</SelectItem>
//                     <SelectItem value="5">5 attempts</SelectItem>
//                     <SelectItem value="unlimited">Unlimited</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="max-questions" className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                   Maximum Questions
//                 </Label>
//                 <Input
//                   id="max-questions"
//                   type="number"
//                   min="1"
//                   max={quiz?.questionCount || 1}
//                   value={formData.maxQuestions}
//                   onChange={(e) => {
//                     const value = Math.min(Number(e.target.value), quiz?.questionCount || 1);
//                     setFormData({ ...formData, maxQuestions: value });
//                   }}
//                   placeholder={`Up to ${quiz?.questionCount || 1}`}
//                   className="h-11 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
//                 />
//                 {quiz?.questionCount && (
//                   <p className="text-xs text-slate-500 dark:text-slate-400">
//                     Max {quiz.questionCount} questions allowed.
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </TabsContent>
//               </Tabs>
//       </div>

//       <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
//         <Button 
//           variant="outline" 
//           onClick={() => onOpenChange(false)}
//           className="h-10 px-6 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
//         >
//           Cancel
//         </Button>
//         <Button 
//           onClick={handleSave} 
//           disabled={loading}
//           className="h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white"
//         >
//           {loading ? (
//             <svg
//               className="animate-spin h-4 w-4 mr-2 text-white"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24">
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"></circle>
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
//             </svg>
//           ) : (
//             <Save className="h-4 w-4 mr-2" />
//           )}
//           {loading ? "Saving..." : isEditing ? "Update Quiz" : "Create Quiz"}
//         </Button>
//       </div>
//     </DialogContent>
//   </Dialog>
// );
}
