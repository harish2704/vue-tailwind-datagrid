<template>
  <div class="data-grid-modal">
    <div class="data-grid-modal-content">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Add Formula Column</h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>
      </div>
      
      <div class="mb-4">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Column Name
          </label>
          <input 
            type="text" 
            v-model="columnName"
            placeholder="Enter column name"
            class="w-full px-3 py-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Formula
          </label>
          <div class="mb-2">
            <textarea 
              v-model="formula"
              rows="4"
              placeholder="Enter formula (e.g., [amount] * 0.1)"
              class="w-full px-3 py-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <p class="text-xs text-gray-500">
            Use column references like [columnName] in your formula. 
            Supported operations: +, -, *, /, %, Math functions.
          </p>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Available Columns
          </label>
          <div class="border rounded-md p-2 max-h-40 overflow-y-auto">
            <div
              v-for="column in availableColumns"
              :key="column.id"
              class="flex items-center justify-between py-1 border-b last:border-b-0"
            >
              <div class="text-sm text-gray-700">
                {{ column.label }}
              </div>
              <button
                @click="insertColumnReference(column.field)"
                class="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Data Type
          </label>
          <select 
            v-model="dataType"
            class="w-full px-3 py-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="number">Number</option>
            <option value="currency">Currency</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>
        
        <div v-if="dataType === 'currency'" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select 
            v-model="currency"
            class="w-full px-3 py-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
      </div>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
        {{ errorMessage }}
      </div>
      
      <div class="flex justify-end">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 mr-2"
        >
          Cancel
        </button>
        <button 
          @click="addFormula"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
          :disabled="!isValid"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'FormulaModal',
  props: {
    columns: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      columnName: '',
      formula: '',
      dataType: 'number',
      currency: 'USD',
      errorMessage: ''
    };
  },
  computed: {
    availableColumns() {
      return this.columns.filter(column => {
        return ['number', 'currency', 'percentage'].includes(column.dataType);
      });
    },
    
    isValid() {
      return this.columnName.trim() !== '' && this.formula.trim() !== '';
    },
    
    formulaColumnId() {
      return `formula_${this.columnName.toLowerCase().replace(/\s+/g, '_')}`;
    },
    
    formulaColumnField() {
      return `formula_${this.columnName.toLowerCase().replace(/\s+/g, '_')}`;
    }
  },
  methods: {
    insertColumnReference(field) {
      this.formula += `[${field}]`;
    },
    
    validateFormula() {
      this.errorMessage = '';
      
      // Check if formula contains at least one column reference
      const columnReferenceRegex = /\[\w+\]/;
      if (!columnReferenceRegex.test(this.formula)) {
        this.errorMessage = 'Formula must contain at least one column reference';
        return false;
      }
      
      // Check if all column references are valid
      const columnReferences = this.formula.match(/\[(\w+)\]/g) || [];
      for (const reference of columnReferences) {
        const fieldName = reference.slice(1, -1); // Remove [ and ]
        const column = this.columns.find(col => col.field === fieldName);
        
        if (!column) {
          this.errorMessage = `Invalid column reference: ${reference}`;
          return false;
        }
        
        if (!['number', 'currency', 'percentage'].includes(column.dataType)) {
          this.errorMessage = `Column ${column.label} is not a numeric type`;
          return false;
        }
      }
      
      // Try to evaluate the formula with dummy values
      try {
        let evalFormula = this.formula;
        
        // Replace column references with 1
        evalFormula = evalFormula.replace(/\[\w+\]/g, '1');
        
        // Evaluate
        // eslint-disable-next-line no-eval
        eval(evalFormula);
        
        return true;
      } catch (error) {
        this.errorMessage = `Formula syntax error: ${error.message}`;
        return false;
      }
    },
    
    addFormula() {
      if (!this.isValid) return;
      
      if (!this.validateFormula()) return;
      
      // Create formula column
      const formulaColumn = {
        id: this.formulaColumnId,
        label: this.columnName,
        field: this.formulaColumnField,
        sortable: true,
        filterable: true,
        filterType: 'number',
        editable: false,
        width: 150,
        dataType: this.dataType,
        formula: this.formula
      };
      
      // Add format for currency
      if (this.dataType === 'currency') {
        formulaColumn.format = {
          type: 'currency',
          currency: this.currency
        };
      }
      
      this.$emit('add-formula', formulaColumn);
      this.$emit('close');
    }
  }
};
</script>
