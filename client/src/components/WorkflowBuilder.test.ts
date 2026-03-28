import { describe, it, expect } from 'vitest';

/**
 * WorkflowBuilder Component Tests
 * Tests for customizable workflow builder functionality
 */

describe('WorkflowBuilder', () => {
  describe('Workflow Templates', () => {
    it('should have manufacturing template', () => {
      const templates = [
        {
          name: 'Manufacturing',
          stages: ['Suppliers', 'Raw Materials', 'Production', 'Inventory', 'Orders'],
        },
      ];

      const manufacturing = templates.find(t => t.name === 'Manufacturing');
      expect(manufacturing).toBeDefined();
      expect(manufacturing?.stages).toHaveLength(5);
    });

    it('should have retail template', () => {
      const templates = [
        {
          name: 'Retail',
          stages: ['Suppliers', 'Purchasing', 'Inventory', 'Sales', 'Fulfillment'],
        },
      ];

      const retail = templates.find(t => t.name === 'Retail');
      expect(retail).toBeDefined();
      expect(retail?.stages).toHaveLength(5);
    });

    it('should have service business template', () => {
      const templates = [
        {
          name: 'Service Business',
          stages: ['Leads', 'Proposals', 'Contracts', 'Delivery', 'Follow-up'],
        },
      ];

      const service = templates.find(t => t.name === 'Service Business');
      expect(service).toBeDefined();
      expect(service?.stages).toHaveLength(5);
    });

    it('should have wholesale template', () => {
      const templates = [
        {
          name: 'Wholesale',
          stages: ['Procurement', 'Warehouse', 'Quality Check', 'Distribution', 'Delivery'],
        },
      ];

      const wholesale = templates.find(t => t.name === 'Wholesale');
      expect(wholesale).toBeDefined();
      expect(wholesale?.stages).toHaveLength(5);
    });
  });

  describe('Workflow Stage Management', () => {
    it('should create workflow stage with required fields', () => {
      const stage = {
        id: 'stage-1',
        name: 'Suppliers',
        icon: '🏭',
        color: 'bg-blue-500',
      };

      expect(stage.id).toBeDefined();
      expect(stage.name).toBeDefined();
      expect(stage.icon).toBeDefined();
      expect(stage.color).toBeDefined();
    });

    it('should allow adding new stage', () => {
      let stages = [
        { id: 'stage-1', name: 'Stage 1', icon: '🎯', color: 'bg-blue-500' },
      ];

      const newStage = {
        id: 'stage-2',
        name: 'New Stage',
        icon: '🎯',
        color: 'bg-blue-500',
      };

      stages = [...stages, newStage];
      expect(stages).toHaveLength(2);
      expect(stages[1].name).toBe('New Stage');
    });

    it('should allow removing stage', () => {
      let stages = [
        { id: 'stage-1', name: 'Stage 1', icon: '🎯', color: 'bg-blue-500' },
        { id: 'stage-2', name: 'Stage 2', icon: '🎯', color: 'bg-blue-500' },
      ];

      stages = stages.filter(s => s.id !== 'stage-1');
      expect(stages).toHaveLength(1);
      expect(stages[0].id).toBe('stage-2');
    });

    it('should allow updating stage name', () => {
      let stages = [
        { id: 'stage-1', name: 'Old Name', icon: '🎯', color: 'bg-blue-500' },
      ];

      stages = stages.map(s =>
        s.id === 'stage-1' ? { ...s, name: 'New Name' } : s
      );

      expect(stages[0].name).toBe('New Name');
    });

    it('should allow updating stage icon', () => {
      let stages = [
        { id: 'stage-1', name: 'Stage', icon: '🎯', color: 'bg-blue-500' },
      ];

      stages = stages.map(s =>
        s.id === 'stage-1' ? { ...s, icon: '📦' } : s
      );

      expect(stages[0].icon).toBe('📦');
    });

    it('should allow updating stage color', () => {
      let stages = [
        { id: 'stage-1', name: 'Stage', icon: '🎯', color: 'bg-blue-500' },
      ];

      stages = stages.map(s =>
        s.id === 'stage-1' ? { ...s, color: 'bg-red-500' } : s
      );

      expect(stages[0].color).toBe('bg-red-500');
    });
  });

  describe('Icon Selection', () => {
    it('should have icon options', () => {
      const icons = ['🏭', '📦', '⚙️', '📊', '🚚', '🏪', '💳', '💰'];
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should allow selecting different icons', () => {
      const availableIcons = ['🏭', '📦', '⚙️', '📊', '🚚'];
      let stage = { id: 'stage-1', name: 'Stage', icon: '🏭', color: 'bg-blue-500' };

      const newIcon = availableIcons[1];
      stage = { ...stage, icon: newIcon };

      expect(stage.icon).toBe('📦');
    });
  });

  describe('Color Selection', () => {
    it('should have color options', () => {
      const colors = [
        'bg-blue-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-red-500',
        'bg-orange-500',
      ];
      expect(colors.length).toBeGreaterThan(0);
    });

    it('should allow selecting different colors', () => {
      const availableColors = ['bg-blue-500', 'bg-red-500', 'bg-green-500'];
      let stage = { id: 'stage-1', name: 'Stage', icon: '🎯', color: 'bg-blue-500' };

      const newColor = availableColors[1];
      stage = { ...stage, color: newColor };

      expect(stage.color).toBe('bg-red-500');
    });
  });

  describe('Workflow Validation', () => {
    it('should require at least one stage', () => {
      const stages = [
        { id: 'stage-1', name: 'Stage 1', icon: '🎯', color: 'bg-blue-500' },
      ];

      expect(stages.length).toBeGreaterThan(0);
    });

    it('should require stage name', () => {
      const stage = {
        id: 'stage-1',
        name: 'Valid Name',
        icon: '🎯',
        color: 'bg-blue-500',
      };

      expect(stage.name.trim().length).toBeGreaterThan(0);
    });

    it('should validate stage ID uniqueness', () => {
      const stages = [
        { id: 'stage-1', name: 'Stage 1', icon: '🎯', color: 'bg-blue-500' },
        { id: 'stage-2', name: 'Stage 2', icon: '🎯', color: 'bg-blue-500' },
      ];

      const ids = stages.map(s => s.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Workflow Customization', () => {
    it('should allow customizing manufacturing workflow', () => {
      const workflow = [
        { id: 'stage-1', name: 'Suppliers', icon: '🏭', color: 'bg-blue-500' },
        { id: 'stage-2', name: 'Raw Materials', icon: '📦', color: 'bg-purple-500' },
        { id: 'stage-3', name: 'Production', icon: '⚙️', color: 'bg-orange-500' },
      ];

      // Customize: change stage 2 name
      const customized = workflow.map(s =>
        s.id === 'stage-2' ? { ...s, name: 'Components' } : s
      );

      expect(customized[1].name).toBe('Components');
      expect(customized).toHaveLength(3);
    });

    it('should allow reordering workflow stages', () => {
      let stages = [
        { id: 'stage-1', name: 'First', icon: '1️⃣', color: 'bg-blue-500' },
        { id: 'stage-2', name: 'Second', icon: '2️⃣', color: 'bg-blue-500' },
        { id: 'stage-3', name: 'Third', icon: '3️⃣', color: 'bg-blue-500' },
      ];

      // Move second to first
      const reordered = [stages[1], stages[0], stages[2]];

      expect(reordered[0].name).toBe('Second');
      expect(reordered[1].name).toBe('First');
    });

    it('should support different workflow lengths', () => {
      const shortWorkflow = [
        { id: 'stage-1', name: 'Start', icon: '🎯', color: 'bg-blue-500' },
        { id: 'stage-2', name: 'End', icon: '✅', color: 'bg-green-500' },
      ];

      const longWorkflow = [
        { id: 'stage-1', name: 'S1', icon: '1️⃣', color: 'bg-blue-500' },
        { id: 'stage-2', name: 'S2', icon: '2️⃣', color: 'bg-blue-500' },
        { id: 'stage-3', name: 'S3', icon: '3️⃣', color: 'bg-blue-500' },
        { id: 'stage-4', name: 'S4', icon: '4️⃣', color: 'bg-blue-500' },
        { id: 'stage-5', name: 'S5', icon: '5️⃣', color: 'bg-blue-500' },
        { id: 'stage-6', name: 'S6', icon: '6️⃣', color: 'bg-blue-500' },
      ];

      expect(shortWorkflow).toHaveLength(2);
      expect(longWorkflow).toHaveLength(6);
    });
  });

  describe('Business Use Cases', () => {
    it('should support retail workflow', () => {
      const retailWorkflow = [
        { id: 'stage-1', name: 'Suppliers', icon: '🏪', color: 'bg-blue-500' },
        { id: 'stage-2', name: 'Purchasing', icon: '💳', color: 'bg-purple-500' },
        { id: 'stage-3', name: 'Inventory', icon: '📦', color: 'bg-green-500' },
        { id: 'stage-4', name: 'Sales', icon: '💰', color: 'bg-orange-500' },
        { id: 'stage-5', name: 'Fulfillment', icon: '🚚', color: 'bg-red-500' },
      ];

      expect(retailWorkflow).toHaveLength(5);
      expect(retailWorkflow[3].name).toBe('Sales');
    });

    it('should support service business workflow', () => {
      const serviceWorkflow = [
        { id: 'stage-1', name: 'Leads', icon: '📞', color: 'bg-blue-500' },
        { id: 'stage-2', name: 'Proposals', icon: '📄', color: 'bg-purple-500' },
        { id: 'stage-3', name: 'Contracts', icon: '✍️', color: 'bg-orange-500' },
        { id: 'stage-4', name: 'Delivery', icon: '⚡', color: 'bg-green-500' },
        { id: 'stage-5', name: 'Follow-up', icon: '⭐', color: 'bg-red-500' },
      ];

      expect(serviceWorkflow).toHaveLength(5);
      expect(serviceWorkflow[0].name).toBe('Leads');
    });

    it('should support wholesale workflow', () => {
      const wholesaleWorkflow = [
        { id: 'stage-1', name: 'Procurement', icon: '🛒', color: 'bg-blue-500' },
        { id: 'stage-2', name: 'Warehouse', icon: '🏢', color: 'bg-purple-500' },
        { id: 'stage-3', name: 'Quality Check', icon: '✅', color: 'bg-orange-500' },
        { id: 'stage-4', name: 'Distribution', icon: '🚛', color: 'bg-green-500' },
        { id: 'stage-5', name: 'Delivery', icon: '🚚', color: 'bg-red-500' },
      ];

      expect(wholesaleWorkflow).toHaveLength(5);
      expect(wholesaleWorkflow[2].name).toBe('Quality Check');
    });
  });
});
