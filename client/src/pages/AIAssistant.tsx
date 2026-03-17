/**
 * TraceCore AI — AI Operations Assistant Page
 * Design: Soft-Dark Enterprise
 * - Simulated AI assistant with NLP-style command parsing
 * - Logs production runs and stock updates via natural language
 */

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Sparkles, Send, Mic, Bot, User, Zap, Package, FlaskConical, Factory, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: {
    type: string;
    details: string;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'init-1',
    role: 'assistant',
    content: `Hello! I'm your TraceCore AI Operations Assistant. I can help you log production runs, update stock, and manage your operations using natural language.\n\nTry commands like:\n• "I produced 20 Lion's Mane tinctures today"\n• "I received 100 bottles from SKS"\n• "How much Lion's Mane stock do I have?"\n• "Log 15 Reishi tinctures batch RE-2025-020"`,
    timestamp: new Date(),
  },
];

// Simple NLP parser for demo
function parseCommand(input: string, state: ReturnType<typeof useApp>['state']): {
  type: 'production' | 'stock_query' | 'order_query' | 'unknown';
  data?: Record<string, unknown>;
  response: string;
  action?: { type: string; details: string };
} {
  const lower = input.toLowerCase();

  // Production run patterns
  const prodPatterns = [
    /(?:produced?|made|manufactured|completed?|finished?|batch(?:ed)?)\s+(\d+)\s+(.+)/i,
    /(\d+)\s+(.+?)\s+(?:produced?|made|completed?)/i,
    /log(?:ged?)?\s+(\d+)\s+(.+)/i,
  ];

  for (const pattern of prodPatterns) {
    const match = input.match(pattern);
    if (match) {
      const qty = parseInt(match[1]);
      const productHint = match[2].toLowerCase().trim();
      const product = state.products.find(p =>
        p.name.toLowerCase().includes(productHint) ||
        productHint.includes(p.name.toLowerCase().split(' ')[0])
      );

      if (product && qty > 0) {
        return {
          type: 'production',
          data: { productId: product.id, quantity: qty },
          response: `Got it! I'll log a production run of **${qty} units** of **${product.name}**. Stock will increase from ${product.stockOnHand} to ${product.stockOnHand + qty} units.`,
          action: { type: 'Production Run', details: `+${qty} ${product.name}` },
        };
      } else if (qty > 0) {
        return {
          type: 'production',
          response: `I found a quantity of ${qty}, but I couldn't match a product. Available products: ${state.products.map(p => p.name).join(', ')}. Please be more specific.`,
        };
      }
    }
  }

  // Stock query patterns
  if (lower.includes('how much') || lower.includes('stock') || lower.includes('inventory') || lower.includes('how many')) {
    const product = state.products.find(p =>
      lower.includes(p.name.toLowerCase().split(' ')[0]) ||
      lower.includes(p.name.toLowerCase())
    );
    const input_item = state.inputs.find(i =>
      lower.includes(i.name.toLowerCase().split(' ')[0]) ||
      lower.includes(i.name.toLowerCase())
    );

    if (product) {
      const isLow = product.stockOnHand <= product.lowStockThreshold;
      return {
        type: 'stock_query',
        response: `**${product.name}**: ${product.stockOnHand} units on hand.${isLow ? ' ⚠️ This is below your low stock threshold of ' + product.lowStockThreshold + ' units. Consider scheduling a production run.' : ' Stock level is healthy.'}`,
      };
    }
    if (input_item) {
      return {
        type: 'stock_query',
        response: `**${input_item.name}**: ${input_item.stockOnHand} ${input_item.unit} on hand.`,
      };
    }

    // General stock overview
    const lowStock = state.products.filter(p => p.stockOnHand <= p.lowStockThreshold);
    return {
      type: 'stock_query',
      response: `Here's your current stock overview:\n\n${state.products.map(p => `• **${p.name}**: ${p.stockOnHand} units${p.stockOnHand <= p.lowStockThreshold ? ' ⚠️ LOW' : ''}`).join('\n')}${lowStock.length > 0 ? `\n\n⚠️ ${lowStock.length} product(s) are below threshold.` : ''}`,
    };
  }

  // Received stock patterns
  if (lower.includes('received') || lower.includes('got') || lower.includes('delivery') || lower.includes('arrived')) {
    const qtyMatch = input.match(/(\d+)/);
    const qty = qtyMatch ? parseInt(qtyMatch[1]) : null;
    const inputItem = state.inputs.find(i =>
      lower.includes(i.name.toLowerCase().split(' ')[0]) ||
      lower.includes(i.name.toLowerCase())
    );

    if (qty && inputItem) {
      return {
        type: 'stock_query',
        response: `Received **${qty} ${inputItem.unit}** of **${inputItem.name}**. I'll update the stock from ${inputItem.stockOnHand} to ${inputItem.stockOnHand + qty} ${inputItem.unit}.`,
        action: { type: 'Supplier Purchase', details: `+${qty} ${inputItem.name}` },
      };
    }
    if (qty) {
      return {
        type: 'stock_query',
        response: `I see you received ${qty} units. Could you specify which raw material? Available inputs: ${state.inputs.map(i => i.name).join(', ')}.`,
      };
    }
  }

  // Order queries
  if (lower.includes('order') || lower.includes('pending') || lower.includes('ship')) {
    const pending = state.orders.filter(o => o.status === 'Pending');
    const packed = state.orders.filter(o => o.status === 'Packed');
    return {
      type: 'order_query',
      response: `Current order status:\n• **${pending.length}** pending order${pending.length !== 1 ? 's' : ''}\n• **${packed.length}** packed and ready to ship\n\n${pending.length > 0 ? 'Pending: ' + pending.map(o => o.customerName).join(', ') : ''}`,
    };
  }

  // Low stock query
  if (lower.includes('low') || lower.includes('restock') || lower.includes('alert')) {
    const lowStock = state.products.filter(p => p.stockOnHand <= p.lowStockThreshold);
    if (lowStock.length === 0) {
      return {
        type: 'stock_query',
        response: 'All products are well-stocked! No low stock alerts at this time. 🎉',
      };
    }
    return {
      type: 'stock_query',
      response: `⚠️ **${lowStock.length} product(s) need restocking:**\n\n${lowStock.map(p => `• **${p.name}**: ${p.stockOnHand}/${p.lowStockThreshold} units (threshold)`).join('\n')}\n\nWould you like me to schedule production runs for these?`,
    };
  }

  return {
    type: 'unknown',
    response: `I'm not sure how to interpret that command. Try:\n• "I produced [qty] [product name]"\n• "I received [qty] [material name]"\n• "How much [product] stock do I have?"\n• "What orders are pending?"\n• "Show low stock alerts"`,
  };
}

export default function AIAssistant() {
  const { state, dispatch } = useApp();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    const userInput = input.trim();
    setInput('');
    setIsTyping(true);

    // Simulate AI processing delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const result = parseCommand(userInput, state);

    // Execute action if applicable
    if (result.type === 'production' && result.data) {
      const { productId, quantity } = result.data as { productId: string; quantity: number };
      dispatch({
        type: 'ADD_PRODUCTION_RUN',
        payload: {
          productId,
          quantity,
          notes: `Logged via AI Assistant: "${userInput}"`,
        },
      });
      toast.success(`Production run logged: +${quantity} units`);
    }

    const assistantMsg: Message = {
      id: `msg-${Date.now()}-ai`,
      role: 'assistant',
      content: result.response,
      timestamp: new Date(),
      action: result.action,
    };

    setIsTyping(false);
    setMessages(prev => [...prev, assistantMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const QUICK_COMMANDS = [
    { label: "Produced 20 Lion's Mane today", icon: Factory },
    { label: "Show low stock alerts", icon: Package },
    { label: "What orders are pending?", icon: ShoppingCart },
    { label: "How much Alcohol 96% do I have?", icon: FlaskConical },
  ];

  return (
    <div className="flex flex-col h-full page-enter">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-violet-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground font-['Plus_Jakarta_Sans']">
              AI Operations Assistant
            </h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <p className="text-xs text-muted-foreground">Prototype simulation · Natural language operations</p>
            </div>
          </div>
          <div className="ml-auto">
            <span className="tc-badge-info">
              <Zap className="w-3 h-3" />
              Beta
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            {/* Avatar */}
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-primary/30 to-violet-500/30'
                : 'bg-muted'
            )}>
              {msg.role === 'assistant'
                ? <Bot className="w-4 h-4 text-primary" />
                : <User className="w-4 h-4 text-muted-foreground" />
              }
            </div>

            {/* Bubble */}
            <div className={cn(
              'max-w-[75%] rounded-2xl px-4 py-3',
              msg.role === 'assistant'
                ? 'bg-card border border-border rounded-tl-sm'
                : 'bg-primary/15 border border-primary/20 rounded-tr-sm'
            )}>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {msg.content.split('**').map((part, i) =>
                  i % 2 === 1
                    ? <strong key={i} className="font-semibold text-foreground">{part}</strong>
                    : part
                )}
              </p>
              {msg.action && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                  <Zap className="w-3 h-3" />
                  <span>Action executed: {msg.action.details}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
                    style={{ animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Commands */}
      <div className="px-6 py-3 border-t border-border shrink-0">
        <p className="text-xs text-muted-foreground mb-2">Quick commands:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_COMMANDS.map(cmd => (
            <button
              key={cmd.label}
              onClick={() => setInput(cmd.label)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted/50 border border-border hover:border-primary/30 hover:text-primary text-muted-foreground transition-all"
            >
              <cmd.icon className="w-3 h-3" />
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border shrink-0">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command... e.g. 'I produced 20 Lion's Mane tinctures today'"
              className="bg-muted/50 border-border focus:border-primary/50 pr-10"
              disabled={isTyping}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => toast.info('Voice input coming soon!')}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          This is a simulated AI assistant. In production, TraceCore AI will use advanced NLP to understand complex operations commands.
        </p>
      </div>
    </div>
  );
}
