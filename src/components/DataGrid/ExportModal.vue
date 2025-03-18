<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Export Data</h2>
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
            Export Format
          </label>
          <div class="flex">
            <button 
              @click="exportFormat = 'csv'"
              :class="[
                'px-3 py-1 text-sm font-medium rounded-md',
                exportFormat === 'csv' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              CSV
            </button>
            <button 
              @click="exportFormat = 'json'"
              :class="[
                'px-3 py-1 text-sm font-medium rounded-md ml-2',
                exportFormat === 'json' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              JSON
            </button>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Export Options
          </label>
          <div class="flex flex-col space-y-2">
            <label class="inline-flex items-center">
              <input 
                type="checkbox" 
                v-model="exportOptions.includeAllColumns"
                class="rounded text-blue-500 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Include all columns (not just visible ones)</span>
            </label>
            <label class="inline-flex items-center">
              <input 
                type="checkbox" 
                v-model="exportOptions.includeFilteredData"
                class="rounded text-blue-500 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Include only filtered data</span>
            </label>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            File Name
          </label>
          <input 
            type="text" 
            v-model="fileName"
            placeholder="Enter file name"
            class="w-full px-3 py-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
          @click="exportData"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Export
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse';

export default {
  name: 'ExportModal',
  props: {
    data: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      exportFormat: 'csv',
      fileName: 'data-export',
      exportOptions: {
        includeAllColumns: false,
        includeFilteredData: true
      }
    };
  },
  methods: {
    exportData() {
      // Prepare data for export
      const dataToExport = this.prepareDataForExport();
      
      // Generate file content
      let fileContent;
      let mimeType;
      let fileExtension;
      
      if (this.exportFormat === 'csv') {
        fileContent = this.generateCSV(dataToExport);
        mimeType = 'text/csv';
        fileExtension = 'csv';
      } else {
        fileContent = this.generateJSON(dataToExport);
        mimeType = 'application/json';
        fileExtension = 'json';
      }
      
      // Create download link
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `${this.fileName}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      this.$emit('close');
    },
    
    prepareDataForExport() {
      // Get columns to include
      const columnsToInclude = this.exportOptions.includeAllColumns 
        ? this.getAllColumns() 
        : this.columns;
      
      // Map data to only include selected columns
      return this.data.map(row => {
        const exportRow = {};
        
        columnsToInclude.forEach(column => {
          if (column.dataType !== 'actions') {
            exportRow[column.field] = row[column.field];
          }
        });
        
        return exportRow;
      });
    },
    
    getAllColumns() {
      // Get all columns except action columns
      return this.columns.filter(column => column.dataType !== 'actions');
    },
    
    generateCSV(data) {
      return Papa.unparse(data);
    },
    
    generateJSON(data) {
      return JSON.stringify(data, null, 2);
    }
  }
};
</script>
