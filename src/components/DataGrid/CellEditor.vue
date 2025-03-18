<template>
  <div class="cell-editor">
    <!-- String Input -->
    <input 
      v-if="column.dataType === 'string'"
      type="text"
      v-model="localValue"
      class="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      @keydown.enter="save"
      @keydown.esc="cancel"
      ref="input"
    />
    
    <!-- Number Input -->
    <input 
      v-else-if="column.dataType === 'number' || column.dataType === 'percentage'"
      type="number"
      v-model.number="localValue"
      class="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      @keydown.enter="save"
      @keydown.esc="cancel"
      ref="input"
    />
    
    <!-- Currency Input -->
    <input 
      v-else-if="column.dataType === 'currency'"
      type="number"
      v-model.number="localValue"
      step="0.01"
      class="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      @keydown.enter="save"
      @keydown.esc="cancel"
      ref="input"
    />
    
    <!-- Date Input -->
    <input 
      v-else-if="column.dataType === 'date'"
      type="date"
      v-model="localValue"
      class="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      @keydown.enter="save"
      @keydown.esc="cancel"
      ref="input"
    />
    
    <!-- Boolean Input -->
    <select 
      v-else-if="column.dataType === 'boolean'"
      v-model="localValue"
      class="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      @change="save"
      @keydown.esc="cancel"
      ref="input"
    >
      <option :value="true">Yes</option>
      <option :value="false">No</option>
    </select>
    
    <!-- Enum Input -->
    <select 
      v-else-if="column.dataType === 'enum'"
      v-model="localValue"
      class="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      @change="save"
      @keydown.esc="cancel"
      ref="input"
    >
      <option 
        v-for="option in column.filterOptions" 
        :key="option" 
        :value="option"
      >
        {{ option }}
      </option>
    </select>
    
    <!-- Array Input (Tags) -->
    <div 
      v-else-if="column.dataType === 'array'"
      class="w-full"
    >
      <div class="flex flex-wrap gap-1 mb-1">
        <span 
          v-for="(tag, index) in localValue" 
          :key="index"
          class="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs flex items-center"
        >
          {{ tag }}
          <button 
            @click="removeTag(index)" 
            class="ml-1 text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </span>
      </div>
      
      <div class="flex">
        <select 
          v-model="newTag"
          class="w-full px-2 py-1 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ref="input"
        >
          <option value="">Select a tag</option>
          <option 
            v-for="option in availableTags" 
            :key="option" 
            :value="option"
          >
            {{ option }}
          </option>
        </select>
        
        <button 
          @click="addTag"
          class="px-2 py-1 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      
      <div class="mt-2 flex justify-end">
        <button 
          @click="save"
          class="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 mr-1"
        >
          Save
        </button>
        <button 
          @click="cancel"
          class="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
    
    <!-- Default Input -->
    <input 
      v-else
      type="text"
      v-model="localValue"
      class="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      @keydown.enter="save"
      @keydown.esc="cancel"
      ref="input"
    />
  </div>
</template>

<script>
export default {
  name: 'CellEditor',
  props: {
    value: {
      type: [String, Number, Boolean, Array, Object],
      default: null
    },
    column: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localValue: null,
      newTag: ''
    };
  },
  computed: {
    availableTags() {
      if (!this.column.filterOptions || !Array.isArray(this.localValue)) return [];
      
      return this.column.filterOptions.filter(option => !this.localValue.includes(option));
    }
  },
  mounted() {
    // Initialize local value
    if (this.column.dataType === 'array') {
      this.localValue = Array.isArray(this.value) ? [...this.value] : [];
    } else {
      this.localValue = this.value;
    }
    
    // Focus the input
    if (this.$refs.input) {
      this.$refs.input.focus();
    }
  },
  methods: {
    save() {
      this.$emit('save', this.localValue);
    },
    
    cancel() {
      this.$emit('cancel');
    },
    
    addTag() {
      if (!this.newTag || !Array.isArray(this.localValue)) return;
      
      if (!this.localValue.includes(this.newTag)) {
        this.localValue.push(this.newTag);
        this.newTag = '';
      }
    },
    
    removeTag(index) {
      if (!Array.isArray(this.localValue)) return;
      
      this.localValue.splice(index, 1);
    }
  }
};
</script>
