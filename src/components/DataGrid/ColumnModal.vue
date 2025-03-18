<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Customize Columns</h2>
        <button 
          @click="$emit('close')" 
          class="text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>
      </div>
      
      <div class="mb-4">
        <div class="flex justify-between mb-2">
          <button 
            @click="selectAll"
            class="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Select All
          </button>
          <button 
            @click="deselectAll"
            class="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Deselect All
          </button>
        </div>
        
        <div class="border rounded-md p-4 max-h-80 overflow-y-auto">
          <div 
            v-for="column in sortedColumns" 
            :key="column.id"
            class="flex items-center justify-between py-2 border-b last:border-b-0"
          >
            <div class="flex items-center">
              <input 
                type="checkbox" 
                :id="column.id" 
                v-model="selectedColumns"
                :value="column.id"
                class="rounded text-blue-500 focus:ring-blue-500"
              />
              <label :for="column.id" class="ml-2 text-sm text-gray-700">
                {{ column.label }}
              </label>
            </div>
            
            <div class="flex items-center">
              <button 
                @click="moveColumnUp(column.id)"
                :disabled="isFirstColumn(column.id)"
                class="text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ↑
              </button>
              <button 
                @click="moveColumnDown(column.id)"
                :disabled="isLastColumn(column.id)"
                class="text-gray-500 hover:text-gray-700 ml-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 mr-2"
        >
          Cancel
        </button>
        <button 
          @click="applyChanges"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColumnModal',
  props: {
    columns: {
      type: Array,
      required: true
    },
    visibleColumns: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedColumns: [],
      columnOrder: []
    };
  },
  computed: {
    sortedColumns() {
      // Return columns in the order specified by columnOrder
      return [...this.columns].sort((a, b) => {
        const indexA = this.columnOrder.indexOf(a.id);
        const indexB = this.columnOrder.indexOf(b.id);
        
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        return indexA - indexB;
      });
    }
  },
  created() {
    // Initialize selected columns
    this.selectedColumns = [...this.visibleColumns];
    
    // Initialize column order
    this.columnOrder = [...this.visibleColumns];
    
    // Add any columns that are not in visibleColumns
    this.columns.forEach(column => {
      if (!this.columnOrder.includes(column.id)) {
        this.columnOrder.push(column.id);
      }
    });
  },
  methods: {
    selectAll() {
      this.selectedColumns = this.columns.map(column => column.id);
    },
    
    deselectAll() {
      this.selectedColumns = [];
    },
    
    moveColumnUp(columnId) {
      const index = this.columnOrder.indexOf(columnId);
      if (index > 0) {
        const newOrder = [...this.columnOrder];
        const temp = newOrder[index];
        newOrder[index] = newOrder[index - 1];
        newOrder[index - 1] = temp;
        this.columnOrder = newOrder;
      }
    },
    
    moveColumnDown(columnId) {
      const index = this.columnOrder.indexOf(columnId);
      if (index < this.columnOrder.length - 1) {
        const newOrder = [...this.columnOrder];
        const temp = newOrder[index];
        newOrder[index] = newOrder[index + 1];
        newOrder[index + 1] = temp;
        this.columnOrder = newOrder;
      }
    },
    
    isFirstColumn(columnId) {
      const visibleColumnOrder = this.columnOrder.filter(id => this.selectedColumns.includes(id));
      return visibleColumnOrder.indexOf(columnId) === 0;
    },
    
    isLastColumn(columnId) {
      const visibleColumnOrder = this.columnOrder.filter(id => this.selectedColumns.includes(id));
      return visibleColumnOrder.indexOf(columnId) === visibleColumnOrder.length - 1;
    },
    
    applyChanges() {
      // Get the selected columns in the correct order
      const orderedSelectedColumns = this.columnOrder.filter(columnId => 
        this.selectedColumns.includes(columnId)
      );
      
      this.$emit('update', orderedSelectedColumns);
      this.$emit('close');
    }
  }
};
</script>
