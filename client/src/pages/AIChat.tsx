import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, Mic, MicOff, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  isAction?: boolean;
  actionStatus?: "pending" | "success" | "error";
}

const SUGGESTIONS = [
  "How is my business performing?",
  "What stock is running low?",
  "Mark all processing orders as shipped",
  "What should I focus on today?",
  "Analyze my profit margins",
  "Add 500g stock to Lion's Mane Powder",
];

export function AIChat() {
  const utils = trpc.useUtils();
  const STORAGE_KEY = "tracecore_ai_chat";
  const WELCOME_MSG: Message = {
    role: "assistant",
    content: "Hi! I'm your TraceCore AI business partner. I can answer questions about your business AND take actions — just ask me to do something like 'mark order 420 as shipped' or 'add 1kg to Lion's Mane stock'. You can also use the mic button to speak your commands.",
  };

  const loadMessages = (): Message[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [WELCOME_MSG];
      const { messages: saved, date } = JSON.parse(stored);
      const today = new Date().toDateString();
      if (date !== today) {
        localStorage.removeItem(STORAGE_KEY);
        return [WELCOME_MSG];
      }
      return saved;
    } catch {
      return [WELCOME_MSG];
    }
  };

  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatMutation = trpc.ai.chat.useMutation();
  const updateOrderMutation = trpc.orders.update.useMutation();
  const addStockMutation = trpc.production.addInputStock.useMutation();
  const updateProductMutation = trpc.products.update.useMutation();
  const createRunMutation = trpc.production.create.useMutation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > 1) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          messages,
          date: new Date().toDateString()
        }));
      } catch {}
    }
  }, [messages]);

  const executeActions = async (actions: any[]) => {
    const results: string[] = [];
    for (const action of actions) {
      try {
        if (action.action === "UPDATE_ORDER_STATUS") {
          await updateOrderMutation.mutateAsync({ id: action.params.orderId, status: action.params.status });
          utils.orders.list.invalidate();
          results.push("✅ " + action.confirm);
        } else if (action.action === "ADD_INPUT_STOCK") {
          await addStockMutation.mutateAsync({ inputId: action.params.inputId, quantity: action.params.quantity });
          utils.inputs.list.invalidate();
          results.push("✅ " + action.confirm);
        } else if (action.action === "UPDATE_PRODUCT_STOCK") {
          await updateProductMutation.mutateAsync({ id: action.params.productId, data: { currentStock: action.params.stock } });
          utils.products.list.invalidate();
          results.push("✅ " + action.confirm);
        } else if (action.action === "CREATE_PRODUCTION_RUN") {
          await createRunMutation.mutateAsync({
            runNumber: "RUN-" + Date.now().toString().slice(-6),
            productId: action.params.productId,
            quantity: action.params.quantity,
            notes: action.params.notes || "",
            startDate: new Date(),
          });
          utils.production.list.invalidate();
          results.push("✅ " + action.confirm);
        }
      } catch (e: any) {
        results.push("❌ Failed: " + action.confirm);
      }
    }
    return results.join("\n");
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content };
    const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const res = await chatMutation.mutateAsync({ message: content, conversationHistory: history });
      if (res.actions && res.actions.length > 0) {
        const actionMsg: Message = { role: "assistant", content: "Executing actions...", isAction: true, actionStatus: "pending" };
        setMessages(prev => [...prev, actionMsg]);
        const resultText = await executeActions(res.actions);
        setMessages(prev => prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content: resultText, actionStatus: "success" } : m
        ));
        toast.success("Actions completed");
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: res.message || "No response" }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setLiveTranscript("");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice not supported in this browser. Use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-ZA";
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setLiveTranscript(transcript);
      if (e.results[e.results.length - 1].isFinal) {
        setInput(transcript);
        setLiveTranscript("");
        setIsListening(false);
      }
    };
    recognition.onend = () => { setIsListening(false); setLiveTranscript(""); };
    recognition.onerror = () => { setIsListening(false); setLiveTranscript(""); toast.error("Voice error. Try again."); };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">AI Business Partner</h1>
          <p className="text-xs text-muted-foreground">Powered by Claude — ask questions or give commands by voice or text</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                msg.isAction ? "bg-green-600" : "bg-gradient-to-br from-purple-500 to-blue-600"
              )}>
                {msg.isAction ? <CheckCircle className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
            )}
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
              msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
            )}>
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        {isListening && liveTranscript && (
          <div className="flex justify-end">
            <div className="bg-primary/20 rounded-2xl px-4 py-2 text-sm italic text-muted-foreground max-w-[80%]">
              {liveTranscript}...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={toggleVoice}
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          title={isListening ? "Stop listening" : "Voice command"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
        <Input
          value={isListening ? liveTranscript || "Listening..." : input}
          onChange={e => !isListening && setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question or give a command..."
          disabled={isLoading || isListening}
          className="flex-1"
        />
        <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
      {isListening && (
        <p className="text-xs text-center text-red-400 mt-2 animate-pulse">🎤 Listening... speak your command</p>
      )}
    </div>
  );
}
