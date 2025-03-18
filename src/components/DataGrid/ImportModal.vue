<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Import Data</h2>
        <button 
          @click="$emit('close')" 
          class="text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>
      </div>
      
      <div class="mb-4">
        <div class="flex mb-2">
          <button 
            @click="activeTab = 'file'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-t-md',
              activeTab === 'file' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            Import File
          </button>
          <button 
            @click="activeTab = 'paste'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-t-md ml-1',
              activeTab === 'paste' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            Paste Data
          </button>
        </div>
        
        <div class="border rounded-md p-4">
          <!-- File Import -->
          <div v-if="activeTab === 'file'">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                File Format
              </label>
              <div class="flex">
                <button 
                  @click="fileFormat = 'csv'"
                  :class="[
                    'px-3 py-1 text-sm font-medium rounded-md',
                    fileFormat === 'csv' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  ]"
                >
                  CSV
                </button>
                <button 
                  @click="fileFormat = 'json'"
                  :class="[
                    'px-3 py-1 text-sm font-medium rounded-md ml-2',
                    fileFormat === 'json' 
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
                Select File
              </label>
              <input 
                type="file" 
                :accept="fileFormat === 'csv' ? '.csv' : '.json'"
                @change="handleFileUpload"
                class="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
          </div>
          
          <!-- Paste Data -->
          <div v-else-if="activeTab === 'paste'">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Data Format
              </label>
              <div class="flex">
                <button 
                  @click="pasteFormat = 'csv'"
                  :class="[
                    'px-3 py-1 text-sm font-medium rounded-md',
                    pasteFormat === 'csv' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  ]"
                >
                  CSV
                </button>
                <button 
                  @click="pasteFormat = 'json'"
                  :class="[
                    'px-3 py-1 text-sm font-medium rounded-md ml-2',
                    pasteFormat === 'json' 
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
                Paste Data
              </label>
              <textarea 
                v-model="pasteData"
                rows="8"
                class="w-full px-3 py-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :placeholder="pasteFormat === 'csv' 
                  ? 'Paste CSV data here...' 
                  : 'Paste JSON data here...'"
              ></textarea>
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
          @click="importData"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
          :disabled="!canImport"
        >
          Import
        </button>
      </div>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="mt-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse';

export default {
  name: 'ImportModal',
  data() {
    return {
      activeTab: 'file',
      fileFormat: 'csv',
      pasteFormat: 'csv',
      fileData: null,
      pasteData: '',
      errorMessage: ''
    };
  },
  computed: {
    canImport() {
      if (this.activeTab === 'file') {
        return !!this.fileData;
      } else {
        return !!this.pasteData.trim();
      }
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      this.errorMessage = '';
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          this.fileData = e.target.result;
        } catch (error) {
          this.errorMessage = `Error reading file: ${error.message}`;
          this.fileData = null;
        }
      };
      
      reader.onerror = () => {
        this.errorMessage = 'Error reading file';
        this.fileData = null;
      };
      
      reader.readAsText(file);
    },
    
    importData() {
      this.errorMessage = '';
      
      try {
        let data;
        
        if (this.activeTab === 'file') {
          if (this.fileFormat === 'csv') {
            data = this.parseCSV(this.fileData);
          } else {
            data = JSON.parse(this.fileData);
          }
        } else {
          if (this.pasteFormat === 'csv') {
            data = this.parseCSV(this.pasteData);
          } else {
            data = JSON.parse(this.pasteData);
          }
        }
        
        // Validate data
        if (!Array.isArray(data)) {
          throw new Error('Imported data must be an array');
        }
        
        // Add IDs if missing
        data = data.map((item, index) => {
          if (!item.id) {
            return { ...item, id: `imported-${index}` };
          }
          return item;
        });
        
        this.$emit('import', data);
      } catch (error) {
        this.errorMessage = `Import error: ${error.message}`;
      }
    },
    
    parseCSV(csvData) {
      const result = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });
      
      if (result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }
      
      return result.data;
    }
  }
};
</script>
