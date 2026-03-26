/**
 * TraceCore AI — Command System
 * Parses and executes natural language commands for business operations.
 */

import { AppState } from './store';

export type CommandType =
  | 'CREATE_PRODUCT'
  | 'ADD_STOCK'
  | 'REDUCE_STOCK'
  | 'CREATE_SUPPLIER'
  | 'CREATE_ORDER'
  | 'MARK_ORDER_SHIPPED'
  | 'LOG_PRODUCTION_RUN'
  | 'CREATE_INPUT'
  | 'UNKNOWN';

export interface ParsedCommand {
  type: CommandType;
  confidence: number; // 0-1
  params: Record<string, string | number>;
  originalText: string;
}

export interface CommandResult {
  success: boolean;
  message: string;
  action?: {
    type: string;
    payload: any;
  };
}

/**
 * Parse natural language command into structured command
 * Examples:
 * - "create product lion's mane"
 * - "add 20 stock to lion's mane"
 * - "log production run of 30 cordyceps"
 * - "create order for john with 5 lion's mane"
 */
export function parseCommand(text: string): ParsedCommand {
  const normalized = text.toLowerCase().trim();

  // CREATE PRODUCT
  if (
    normalized.match(/^(create|add|new)\s+(product|item)\s+(.+)$/i) ||
    normalized.match(/^(create|add)\s+(.+)$/i)
  ) {
    const match =
      normalized.match(/^(create|add|new)\s+(product|item)\s+(.+)$/i) ||
      normalized.match(/^(create|add)\s+(.+)$/i);
    if (match) {
      const productName = match[match.length - 1];
      return {
        type: 'CREATE_PRODUCT',
        confidence: 0.85,
        params: { name: productName },
        originalText: text,
      };
    }
  }

  // ADD STOCK
  if (normalized.match(/add\s+(\d+)\s+(stock|units?)\s+to\s+(.+)/i)) {
    const match = normalized.match(/add\s+(\d+)\s+(stock|units?)\s+to\s+(.+)/i);
    if (match) {
      return {
        type: 'ADD_STOCK',
        confidence: 0.9,
        params: {
          quantity: parseInt(match[1]),
          productName: match[3],
        },
        originalText: text,
      };
    }
  }

  // REDUCE STOCK
  if (normalized.match(/reduce\s+(\d+)\s+(stock|units?)\s+from\s+(.+)/i)) {
    const match = normalized.match(/reduce\s+(\d+)\s+(stock|units?)\s+from\s+(.+)/i);
    if (match) {
      return {
        type: 'REDUCE_STOCK',
        confidence: 0.9,
        params: {
          quantity: parseInt(match[1]),
          productName: match[3],
        },
        originalText: text,
      };
    }
  }

  // CREATE SUPPLIER
  if (normalized.match(/create\s+supplier\s+(.+)/i)) {
    const match = normalized.match(/create\s+supplier\s+(.+)/i);
    if (match) {
      return {
        type: 'CREATE_SUPPLIER',
        confidence: 0.85,
        params: { name: match[1] },
        originalText: text,
      };
    }
  }

  // CREATE ORDER
  if (normalized.match(/create\s+order\s+(?:for\s+)?(.+?)(?:\s+with\s+(.+))?$/i)) {
    const match = normalized.match(/create\s+order\s+(?:for\s+)?(.+?)(?:\s+with\s+(.+))?$/i);
    if (match) {
      return {
        type: 'CREATE_ORDER',
        confidence: 0.8,
        params: {
          customerName: match[1],
          items: match[2] || '',
        },
        originalText: text,
      };
    }
  }

  // MARK ORDER SHIPPED
  if (normalized.match(/mark\s+order\s+(.+?)\s+(?:as\s+)?shipped/i)) {
    const match = normalized.match(/mark\s+order\s+(.+?)\s+(?:as\s+)?shipped/i);
    if (match) {
      return {
        type: 'MARK_ORDER_SHIPPED',
        confidence: 0.85,
        params: { orderId: match[1] },
        originalText: text,
      };
    }
  }

  // LOG PRODUCTION RUN
  if (
    normalized.match(/(?:log|create)\s+production\s+(?:run\s+)?of\s+(\d+)\s+(.+)/i) ||
    normalized.match(/produced?\s+(\d+)\s+(?:bottles?|units?|boxes?)\s+of\s+(.+)/i)
  ) {
    const match =
      normalized.match(/(?:log|create)\s+production\s+(?:run\s+)?of\s+(\d+)\s+(.+)/i) ||
      normalized.match(/produced?\s+(\d+)\s+(?:bottles?|units?|boxes?)\s+of\s+(.+)/i);
    if (match) {
      return {
        type: 'LOG_PRODUCTION_RUN',
        confidence: 0.9,
        params: {
          quantity: parseInt(match[1]),
          productName: match[2],
        },
        originalText: text,
      };
    }
  }

  // CREATE INPUT
  if (normalized.match(/create\s+input\s+(.+?)\s+from\s+(.+)/i)) {
    const match = normalized.match(/create\s+input\s+(.+?)\s+from\s+(.+)/i);
    if (match) {
      return {
        type: 'CREATE_INPUT',
        confidence: 0.85,
        params: {
          name: match[1],
          supplierName: match[2],
        },
        originalText: text,
      };
    }
  }

  return {
    type: 'UNKNOWN',
    confidence: 0,
    params: {},
    originalText: text,
  };
}

/**
 * Execute parsed command against app state
 * Returns action to dispatch and success message
 */
export function executeCommand(
  command: ParsedCommand,
  state: AppState
): CommandResult {
  const { type, params } = command;

  switch (type) {
    case 'CREATE_PRODUCT': {
      const name = String(params.name || '').trim();
      if (!name) return { success: false, message: 'Product name is required' };
      return {
        success: true,
        message: `✓ Product "${name}" created`,
        action: {
          type: 'ADD_PRODUCT',
          payload: {
            name,
            description: '',
            stockOnHand: 0,
            lowStockThreshold: 10,
          },
        },
      };
    }

    case 'ADD_STOCK': {
      const productName = String(params.productName || '').trim();
      const quantity = Number(params.quantity) || 0;
      const product = state.products.find(p =>
        p.name.toLowerCase().includes(productName.toLowerCase())
      );
      if (!product) {
        return { success: false, message: `Product "${productName}" not found` };
      }
      return {
        success: true,
        message: `✓ Added ${quantity} units to "${product.name}"`,
        action: {
          type: 'UPDATE_PRODUCT',
          payload: {
            id: product.id,
            stockOnHand: product.stockOnHand + quantity,
          },
        },
      };
    }

    case 'REDUCE_STOCK': {
      const productName = String(params.productName || '').trim();
      const quantity = Number(params.quantity) || 0;
      const product = state.products.find(p =>
        p.name.toLowerCase().includes(productName.toLowerCase())
      );
      if (!product) {
        return { success: false, message: `Product "${productName}" not found` };
      }
      return {
        success: true,
        message: `✓ Reduced ${quantity} units from "${product.name}"`,
        action: {
          type: 'UPDATE_PRODUCT',
          payload: {
            id: product.id,
            stockOnHand: Math.max(0, product.stockOnHand - quantity),
          },
        },
      };
    }

    case 'CREATE_SUPPLIER': {
      const name = String(params.name || '').trim();
      if (!name) return { success: false, message: 'Supplier name is required' };
      return {
        success: true,
        message: `✓ Supplier "${name}" created`,
        action: {
          type: 'ADD_SUPPLIER',
          payload: {
            name,
            contactInfo: 'Contact info pending',
          },
        },
      };
    }

    case 'CREATE_ORDER': {
      const customerName = String(params.customerName || '').trim();
      if (!customerName) return { success: false, message: 'Customer name is required' };
      return {
        success: true,
        message: `✓ Order for "${customerName}" created`,
        action: {
          type: 'ADD_ORDER',
          payload: {
            customerName,
            items: [],
          },
        },
      };
    }

    case 'LOG_PRODUCTION_RUN': {
      const productName = String(params.productName || '').trim();
      const quantity = Number(params.quantity) || 0;
      const product = state.products.find(p =>
        p.name.toLowerCase().includes(productName.toLowerCase())
      );
      if (!product) {
        return { success: false, message: `Product "${productName}" not found` };
      }
      return {
        success: true,
        message: `✓ Production run: ${quantity} units of "${product.name}"`,
        action: {
          type: 'ADD_PRODUCTION_RUN',
          payload: {
            productId: product.id,
            quantity,
            notes: `Command: ${params.productName}`,
          },
        },
      };
    }

    case 'CREATE_INPUT': {
      const name = String(params.name || '').trim();
      const supplierName = String(params.supplierName || '').trim();
      const supplier = state.suppliers.find(s =>
        s.name.toLowerCase().includes(supplierName.toLowerCase())
      );
      if (!supplier) {
        return { success: false, message: `Supplier "${supplierName}" not found` };
      }
      return {
        success: true,
        message: `✓ Input "${name}" created from "${supplier.name}"`,
        action: {
          type: 'ADD_INPUT',
          payload: {
            name,
            supplierId: supplier.id,
            stockOnHand: 0,
            unit: 'unit',
          },
        },
      };
    }

    case 'UNKNOWN':
    default:
      return {
        success: false,
        message: 'Command not recognized. Try: "create product [name]", "add [qty] stock to [product]", etc.',
      };
  }
}
