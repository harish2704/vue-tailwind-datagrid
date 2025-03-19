<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-8">Vue 3 Data Grid Component</h1>
    
    <div class="bg-white shadow-md rounded-lg p-6">
      <DataGrid 
        :data="tableData" 
        :columns="tableColumns"
        :options="tableOptions"
        @row-updated="handleRowUpdated"
        @row-deleted="handleRowDeleted"
      />
    </div>
  </div>
</template>

<script>
import DataGrid from './components/DataGrid/DataGrid.vue';
import { generateSampleData, generateColumns } from './utils/sampleData';

export default {
  name: 'App',
  components: {
    DataGrid
  },
  data() {
    return {
      tableData: [],
      tableColumns: [],
      tableOptions: {
        pagination: true,
        itemsPerPage: 5,
        itemsPerPageOptions: [5, 10, 20, 50, 100],
        globalSearch: true,
        editable: true,
        exportable: true,
        importable: true,
        customizeColumns: true,
        customFormulas: true,
        draggableRows: true,
        draggableColumns: true,
        resizableColumns: true,
        treeView: true,
        saveState: !true
      }
    };
  },
  created() {
    // Generate sample data and columns
    this.tableData = generateSampleData(300);
    this.tableColumns = generateColumns();
  },
  methods: {
    handleRowUpdated(rowData) {
      console.log('Row updated:', rowData);
      // In a real application, you would update your data source here
    },
    handleRowDeleted(rowId) {
      console.log('Row deleted:', rowId);
      // In a real application, you would update your data source here
      this.tableData = this.tableData.filter(row => row.id !== rowId);
    }
  }
};
</script>
