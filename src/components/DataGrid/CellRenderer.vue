<template>
  <div>
    <!-- String -->
    <span v-if="column.dataType === 'string'">
      {{ value }}
    </span>
    
    <!-- Number -->
    <span v-else-if="column.dataType === 'number'">
      {{ value }}
    </span>
    
    <!-- Currency -->
    <span v-else-if="column.dataType === 'currency'">
      {{ formatCurrency(value, column.format?.currency || 'USD') }}
    </span>
    
    <!-- Date -->
    <span v-else-if="column.dataType === 'date'">
      {{ formatDate(value) }}
    </span>
    
    <!-- Boolean -->
    <span v-else-if="column.dataType === 'boolean'">
      <span v-if="value === true" class="text-green-600">Yes</span>
      <span v-else-if="value === false" class="text-red-600">No</span>
      <span v-else>-</span>
    </span>
    
    <!-- Percentage -->
    <span v-else-if="column.dataType === 'percentage'">
      <div class="flex items-center">
        <div class="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
          <div 
            class="bg-blue-600 h-2.5 rounded-full" 
            :style="{ width: `${Math.min(100, Math.max(0, value))}%` }"
          ></div>
        </div>
        <span>{{ value }}%</span>
      </div>
    </span>
    
    <!-- Enum -->
    <span v-else-if="column.dataType === 'enum'">
      <span 
        :class="{
          'px-2 py-1 rounded-full text-xs font-medium': true,
          'bg-green-100 text-green-800': value === 'Active',
          'bg-red-100 text-red-800': value === 'Inactive',
          'bg-yellow-100 text-yellow-800': value === 'Pending',
          'bg-blue-100 text-blue-800': value === 'Completed',
          'bg-gray-100 text-gray-800': value === 'Cancelled'
        }"
      >
        {{ value }}
      </span>
    </span>
    
    <!-- Array (Tags) -->
    <span v-else-if="column.dataType === 'array'">
      <div class="flex flex-wrap gap-1">
        <span 
          v-for="(tag, index) in value" 
          :key="index"
          class="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs"
        >
          {{ tag }}
        </span>
      </div>
    </span>
    
    <!-- Actions -->
    <span v-else-if="column.dataType === 'actions'">
      <div class="flex items-center">
        <button 
          @click="$emit('edit', row)"
          class="data-grid-action-button"
        >
          Edit
        </button>
        <button 
          @click="$emit('delete', row.id)"
          class="data-grid-action-button text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </div>
    </span>
    
    <!-- Default -->
    <span v-else>
      {{ value }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'CellRenderer',
  props: {
    value: {
      type: [String, Number, Boolean, Array, Object],
      default: null
    },
    column: {
      type: Object,
      required: true
    },
    row: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatCurrency(value, currency) {
      if (value === null || value === undefined) return '';
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(value);
    },
    
    formatDate(value) {
      if (!value) return '';
      
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
  }
};
</script>
