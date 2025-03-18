<template>
  <div class="p-2 bg-white shadow-lg rounded-md">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-sm font-medium">Filter: {{ column.label }}</h3>
      <button 
        @click="$emit('close')" 
        class="text-gray-500 hover:text-gray-700"
      >
        &times;
      </button>
    </div>
    
    <!-- Text Filter -->
    <div v-if="column.filterType === 'text'" class="mb-2">
      <input 
        type="text" 
        v-model="localFilterValue"
        placeholder="Search..."
        class="w-full px-2 py-1 border rounded-md text-sm"
        @input="debounceFilter"
      />
    </div>
    
    <!-- Number Filter -->
    <div v-else-if="column.filterType === 'number'" class="mb-2">
      <input 
        type="number" 
        v-model.number="localFilterValue"
        placeholder="Enter value..."
        class="w-full px-2 py-1 border rounded-md text-sm"
        @input="debounceFilter"
      />
    </div>
    
    <!-- Date Filter -->
    <div v-else-if="column.filterType === 'date'" class="mb-2">
      <input 
        type="date" 
        v-model="localFilterValue"
        class="w-full px-2 py-1 border rounded-md text-sm"
        @input="applyFilter"
      />
    </div>
    
    <!-- Boolean Filter -->
    <div v-else-if="column.filterType === 'boolean'" class="mb-2">
      <div class="flex items-center mb-1">
        <input 
          type="radio" 
          id="true" 
          value="true" 
          v-model="localFilterValue"
          @change="applyFilter"
          class="mr-1"
        />
        <label for="true" class="text-sm">Yes</label>
      </div>
      <div class="flex items-center mb-1">
        <input 
          type="radio" 
          id="false" 
          value="false" 
          v-model="localFilterValue"
          @change="applyFilter"
          class="mr-1"
        />
        <label for="false" class="text-sm">No</label>
      </div>
      <div class="flex items-center">
        <input 
          type="radio" 
          id="all" 
          value="" 
          v-model="localFilterValue"
          @change="applyFilter"
          class="mr-1"
        />
        <label for="all" class="text-sm">All</label>
      </div>
    </div>
    
    <!-- Select Filter -->
    <div v-else-if="column.filterType === 'select'" class="mb-2">
      <select 
        v-model="localFilterValue"
        class="w-full px-2 py-1 border rounded-md text-sm"
        @change="applyFilter"
      >
        <option value="">All</option>
        <option 
          v-for="option in column.filterOptions" 
          :key="option" 
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </div>
    
    <!-- Multiselect Filter -->
    <div v-else-if="column.filterType === 'multiselect'" class="mb-2">
      <div 
        v-for="option in column.filterOptions" 
        :key="option"
        class="flex items-center mb-1"
      >
        <input 
          type="checkbox" 
          :id="option" 
          :value="option" 
          v-model="selectedOptions"
          @change="updateMultiselect"
          class="mr-1"
        />
        <label :for="option" class="text-sm">{{ option }}</label>
      </div>
    </div>
    
    <!-- Filter Actions -->
    <div class="flex justify-between">
      <button 
        @click="clearFilter"
        class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
      >
        Clear
      </button>
      <button 
        @click="applyFilter"
        class="px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Apply
      </button>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash';

export default {
  name: 'ColumnFilter',
  props: {
    column: {
      type: Object,
      required: true
    },
    filterValue: {
      type: [String, Number, Boolean, Array],
      default: null
    }
  },
  data() {
    return {
      localFilterValue: null,
      selectedOptions: []
    };
  },
  created() {
    // Initialize local filter value
    if (this.column.filterType === 'multiselect') {
      this.selectedOptions = Array.isArray(this.filterValue) ? [...this.filterValue] : [];
    } else {
      this.localFilterValue = this.filterValue;
    }
    
    // Create debounced filter function
    this.debounceFilter = debounce(this.applyFilter, 300);
  },
  methods: {
    applyFilter() {
      if (this.column.filterType === 'multiselect') {
        this.$emit('filter-change', this.selectedOptions.length > 0 ? this.selectedOptions : null);
      } else {
        this.$emit('filter-change', this.localFilterValue);
      }
    },
    
    updateMultiselect() {
      this.applyFilter();
    },
    
    clearFilter() {
      if (this.column.filterType === 'multiselect') {
        this.selectedOptions = [];
      } else {
        this.localFilterValue = null;
      }
      
      this.applyFilter();
    }
  }
};
</script>
