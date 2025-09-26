import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { FileText, AlertTriangle, Clock, Shield, Eye, Monitor, Wifi, CheckCircle2, ArrowRight } from "lucide-react";

const AssessmentInstructions = ({ time, onAccept }) => {
  const [accepted, setAccepted] = useState(false);

  // Your existing security functions
  const isDevToolsOpen = () => {
    // Your existing implementation
    return false; // placeholder
  };

  const isFullscreenActive = () => {
    // Your existing implementation
    return true; // placeholder
  };

  const handleAcceptInstructions = () => {
    if (onAccept) onAccept();
  };

  const instructionItems = [
    {
      icon: Clock,
      text: `This assessment has a time limit of ${time} minutes.`,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: AlertTriangle,
      text: "Once started, the timer cannot be paused.",
      color: "text-amber-600 dark:text-amber-400"
    },
    {
      icon: CheckCircle2,
      text: "You must answer all questions before submitting.",
      color: "text-green-600 dark:text-green-400"
    },
    {
      icon: Monitor,
      text: "You are now in fullscreen mode and cannot exit during the assessment.",
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: Shield,
      text: "Right-click, developer tools, and certain keyboard shortcuts are disabled.",
      color: "text-red-600 dark:text-red-400"
    },
    {
      icon: Eye,
      text: "Switching tabs or windows will trigger a warning (Auto-Submit/Session Termination).",
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      icon: AlertTriangle,
      text: "Multiple violations may result in automatic submission/termination.",
      color: "text-red-600 dark:text-red-400"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <Card className="w-full max-w-4xl shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 relative">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/20 to-transparent dark:from-blue-800/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 to-transparent dark:from-indigo-800/20 rounded-full translate-y-12 -translate-x-12"></div>

        <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
          {/* Header Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0V0zm20 20v20h20V20H20z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="relative flex items-center gap-4 py-2">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <CardTitle className="text-2xl lg:text-3xl font-bold">
                Assessment Instructions
              </CardTitle>
              <p className="text-blue-100 mt-1 text-sm lg:text-base">
                Please read carefully before proceeding
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 lg:p-8 space-y-8">
          {/* Main Instructions */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Before you begin:
              </h3>
            </div>

            <div className="grid gap-4">
              {instructionItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 hover:shadow-sm transition-all duration-200"
                >
                  <div className={`p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm lg:text-base leading-relaxed flex-1 pt-1">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notice */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10 dark:from-amber-600/10 dark:to-orange-600/10 rounded-xl"></div>
            <div className="relative p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-xl border border-amber-200 dark:border-amber-700/50">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                  <Wifi className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-900 dark:text-amber-200 text-lg mb-2">
                    Connection & Environment Check
                  </h4>
                  <p className="text-amber-800 dark:text-amber-300 text-sm lg:text-base leading-relaxed">
                    Ensure you have a stable internet connection and enough time to complete 
                    the assessment without interruptions. Find a quiet environment where you 
                    won't be disturbed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Acceptance */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 dark:from-blue-600/10 dark:to-indigo-600/10 rounded-xl"></div>
              <div className="relative p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl border border-blue-200 dark:border-blue-700/50">
                <div className="flex items-start gap-4">
                  <Checkbox
                    id="accept"
                    checked={accepted}
                    onCheckedChange={async (val) => {
                      if (!val) {
                        setAccepted(false);
                        return;
                      }

                      // Security checks
                      if (isDevToolsOpen() || !isFullscreenActive()) {
                        const reason = isDevToolsOpen()
                          ? "Developer Tools detected. Close them to start."
                          : "Fullscreen is required. Enter fullscreen to start.";

                        // Your toast implementation
                        console.warn(reason);

                        // Attempt to request fullscreen if needed
                        if (!isFullscreenActive()) {
                          const el = document.documentElement;
                          if (el.requestFullscreen) el.requestFullscreen();
                          else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                          else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
                          else if (el.msRequestFullscreen) el.msRequestFullscreen();
                        }

                        setAccepted(false);
                        return;
                      }

                      setAccepted(true);
                    }}
                    className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />

                  <div className="flex-1">
                    <label
                      htmlFor="accept"
                      className="text-blue-900 dark:text-blue-200 font-semibold cursor-pointer select-none text-base lg:text-lg"
                    >
                      Terms & Conditions Agreement
                    </label>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                      I have read, understood, and agree to all the assessment terms and conditions listed above.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleAcceptInstructions}
                disabled={!accepted || isDevToolsOpen() || !isFullscreenActive()}
                size="lg"
                className={`group relative px-8 py-4 text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  !accepted || isDevToolsOpen() || !isFullscreenActive()
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {!accepted || isDevToolsOpen() || !isFullscreenActive() ? (
                  <>
                    <Shield className="w-5 h-5 mr-3" />
                    Security Check Required
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Start Assessment
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
                
                {/* Button glow effect */}
                {accepted && !isDevToolsOpen() && isFullscreenActive() && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                )}
              </Button>
            </div>

            {/* Status Indicators */}
            <div className="flex justify-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isFullscreenActive() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Fullscreen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${!isDevToolsOpen() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Security</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${accepted ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Agreement</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentInstructions;