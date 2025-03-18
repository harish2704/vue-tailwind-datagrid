<template>
  <div class="data-grid-container">
    <!-- Table Controls -->
    <div class="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <!-- Global Search -->
      <div v-if="options.globalSearch" class="data-grid-search w-full md:w-1/3">
        <input type="text" v-model="searchQuery" placeholder="Search..." class="px-4 py-2 border rounded-md w-full"
          @input="handleSearch" />
      </div>

      <!-- Table Actions -->
      <div class="flex flex-wrap gap-2">
        <!-- Import/Export -->
        <div v-if="options.importable || options.exportable" class="flex gap-2">
          <button v-if="options.importable" @click="showImportModal = true"
            class="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            Import
          </button>
          <button v-if="options.exportable" @click="showExportModal = true"
            class="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
            Export
          </button>
        </div>

        <!-- Column Customization -->
        <button v-if="options.customizeColumns" @click="showColumnModal = true"
          class="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">
          Columns
        </button>

        <!-- Custom Formula -->
        <button v-if="options.customFormulas" @click="showFormulaModal = true"
          class="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
          Add Formula
        </button>

        <!-- Save State -->
        <button v-if="options.saveState" @click="saveTableState"
          class="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700">
          Save State
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="data-grid">
        <!-- Table Header -->
        <thead class="data-grid-header">
          <tr>
            <!-- Drag Handle Column for Rows -->
            <th v-if="options.draggableRows" class="w-10">#</th>

            <!-- Expandable Icon for Tree View -->
            <th v-if="options.treeView" class="w-10">#</th>

            <!-- Column Headers -->
            <th v-for="column in visibleColumns" :key="column.id"
              :style="{ width: column.width + 'px', minWidth: column.width + 'px' }" class="relative">
              <div class="flex items-center">
                <!-- Drag Handle for Columns -->
                <div v-if="options.draggableColumns"
                  class="drag-handle mr-2 cursor-move text-gray-400 hover:text-gray-600" title="Drag to reorder column">
                  ⋮⋮
                </div>
                <span>{{ column.label }}</span>

                <!-- Sort Icon -->
                <button v-if="column.sortable" @click="sortBy(column.field)" class="ml-1">
                  <span v-if="sortField === column.field && sortOrder === 'asc'">▲</span>
                  <span v-else-if="sortField === column.field && sortOrder === 'desc'">▼</span>
                  <span v-else>⇅</span>
                </button>

                <!-- Filter Icon -->
                <button v-if="column.filterable" @click="toggleFilter(column.id)" class="ml-1 data-grid-filter-icon">
                  <span>🔍</span>
                </button>
              </div>

              <!-- Column Filter Dropdown -->
              <div v-if="column.filterable && activeFilter === column.id" class="data-grid-filter">
                <ColumnFilter :column="column" :filter-value="filters[column.field]"
                  @filter-change="updateFilter(column.field, $event)" @close="activeFilter = null" />
              </div>

              <!-- Column Resize Handle -->
              <div v-if="options.resizableColumns" class="absolute top-0 right-0 h-full w-1 bg-gray-300 cursor-col-resize"
                @mousedown="startColumnResize($event, column)" 
                @touchstart="startColumnResize($event, column)" ></div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="data-grid-body">
          <template v-for="(row, rowIndex) in paginatedData" :key="row.id">
            <tr :class="['data-grid-row']" :data-id="row.id">
              <!-- Drag Handle for Rows -->
              <td v-if="options.draggableRows" class="text-center w-10">
                <div class="row-drag-handle cursor-move text-gray-400 hover:text-gray-600" title="Drag to reorder row">
                  ⋮⋮
                </div>
              </td>

              <!-- Tree View Expand/Collapse -->
              <td v-if="options.treeView" class="text-center">
                <button v-if="hasChildren(row.id)" @click="toggleRowExpand(row.id)" class="w-6 h-6 text-center">
                  <span v-if="expandedRows.includes(row.id)">-</span>
                  <span v-else>+</span>
                </button>
              </td>

              <!-- Row Cells -->
              <td v-for="column in visibleColumns" :key="column.id" :class="[
                'data-grid-cell',
                { 'data-grid-cell-editable': column.editable && options.editable }
              ]" @click="column.editable && options.editable ? startEditing(row, column) : null"
                @keydown="handleKeyNavigation($event, rowIndex, column.id)" tabindex="0">
                <!-- Cell Content -->
                <div v-if="editingCell.rowId === row.id && editingCell.columnId === column.id">
                  <CellEditor :value="row[column.field]" :column="column" @save="saveCell" @cancel="cancelEditing" />
                </div>
                <div v-else>
                  <CellRenderer :value="row[column.field]" :column="column" :row="row" />
                </div>
              </td>
            </tr>

            <!-- Child Rows for Tree View -->
            <template v-if="options.treeView && expandedRows.includes(row.id)">
              <tr v-for="childRow in getChildRows(row.id)" :key="childRow.id" class="data-grid-row bg-gray-50">
                <!-- Drag Handle for Child Rows -->
                <td v-if="options.draggableRows" class="text-center w-10">
                  <div class="row-drag-handle cursor-move text-gray-400 hover:text-gray-600" title="Drag to reorder row">
                    ⋮⋮
                  </div>
                </td>

                <td v-if="options.treeView" class="text-center">
                  <button v-if="hasChildren(childRow.id)" @click="toggleRowExpand(childRow.id)"
                    class="w-6 h-6 text-center ml-4">
                    <span v-if="expandedRows.includes(childRow.id)">-</span>
                    <span v-else>+</span>
                  </button>
                  <span v-else class="ml-4"></span>
                </td>

                <td v-for="column in visibleColumns" :key="column.id" :class="[
                  'data-grid-cell',
                  { 'data-grid-cell-editable': column.editable && options.editable }
                ]" @click="column.editable && options.editable ? startEditing(childRow, column) : null">
                  <div v-if="editingCell.rowId === childRow.id && editingCell.columnId === column.id">
                    <CellEditor :value="childRow[column.field]" :column="column" @save="saveCell"
                      @cancel="cancelEditing" />
                  </div>
                  <div v-else>
                    <CellRenderer :value="childRow[column.field]" :column="column" :row="childRow" />
                  </div>
                </td>
              </tr>
            </template>
          </template>

          <!-- Empty State -->
          <tr v-if="paginatedData.length === 0">
            <td :colspan="visibleColumns.length + (options.treeView ? 1 : 0)" class="py-4 text-center text-gray-500">
              No data available
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="options.pagination" class="data-grid-pagination">
      <div class="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <!-- Page Details - Full width on mobile, left aligned on desktop -->
        <div class="flex items-center justify-center sm:justify-start">
          <span class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ startIndex + 1 }}</span>
            to
            <span class="font-medium">{{ Math.min(endIndex, filteredData.length) }}</span>
            of
            <span class="font-medium">{{ filteredData.length }}</span>
            results
          </span>
        </div>

        <!-- Items Per Page - Full width on mobile, right aligned on desktop -->
        <div class="flex items-center justify-center sm:justify-end">
          <label for="perPage" class="mr-2 text-sm text-gray-700">Per Page:</label>
          <select id="perPage" v-model="itemsPerPage" class="border rounded-md px-2 py-1 text-sm">
            <option v-for="option in options.itemsPerPageOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <!-- Page Navigation - Full width on mobile, right aligned on desktop -->
        <div class="flex items-center justify-center sm:justify-end space-x-1">
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
            class="px-2 py-1 border rounded-md text-sm disabled:opacity-50">
            Previous
          </button>

          <button v-for="page in displayedPages" :key="page" @click="goToPage(page)" :class="[
            'px-3 py-1 border rounded-md text-sm',
            currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-700'
          ]">
            {{ page }}
          </button>

          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="px-2 py-1 border rounded-md text-sm disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ImportModal v-if="showImportModal" @close="showImportModal = false" @import="importData" />

    <ExportModal v-if="showExportModal" :data="filteredData" :columns="visibleColumns" @close="showExportModal = false" />

    <ColumnModal v-if="showColumnModal" :columns="columns" :visible-columns="visibleColumnIds"
      @update="updateVisibleColumns" @close="showColumnModal = false" />

    <FormulaModal v-if="showFormulaModal" :columns="columns" @add-formula="addFormulaColumn"
      @close="showFormulaModal = false" />
  </div>
</template>

<script>
import { debounce } from 'lodash';
import Sortable from 'sortablejs';
import CellRenderer from './CellRenderer.vue';
import CellEditor from './CellEditor.vue';
import ColumnFilter from './ColumnFilter.vue';
import ImportModal from './ImportModal.vue';
import ExportModal from './ExportModal.vue';
import ColumnModal from './ColumnModal.vue';
import FormulaModal from './FormulaModal.vue';
import { debug } from './logger.js';

export default {
  name: 'DataGrid',
  components: {
    CellRenderer,
    CellEditor,
    ColumnFilter,
    ImportModal,
    ExportModal,
    ColumnModal,
    FormulaModal
  },
  props: {
    data: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    options: {
      type: Object,
      default: () => ({
        pagination: true,
        itemsPerPage: 10,
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
        saveState: true
      })
    }
  },
  data() {
    return {
      columnsHashMap: new Map(),
      // Data state
      localData: [],

      // Sorting
      sortField: '',
      sortOrder: 'asc',

      // Filtering
      filters: {},
      activeFilter: null,
      searchQuery: '',

      // Pagination
      currentPage: 1,
      itemsPerPage: 10,

      // Editing
      editingCell: {
        rowId: null,
        columnId: null,
        value: null
      },

      // Column visibility
      visibleColumnIds: [],

      // Tree view
      expandedRows: [],

      // Modals
      showImportModal: false,
      showExportModal: false,
      showColumnModal: false,
      showFormulaModal: false,

      // Resizing
      resizingColumn: null,
      startX: 0,
      startWidth: 0
    };
  },
  computed: {
    // Filtered data based on filters and search query
    filteredData() {
      let result = [...this.localData];

      // Apply column filters
      Object.keys(this.filters).forEach(field => {
        const filterValue = this.filters[field];
        if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
          const column = this.columns.find(col => col.field === field);

          if (column) {
            switch (column.filterType) {
              case 'text':
                result = result.filter(row => {
                  const value = row[field];
                  return value && value.toString().toLowerCase().includes(filterValue.toLowerCase());
                });
                break;
              case 'number':
                result = result.filter(row => {
                  const value = parseFloat(row[field]);
                  return !isNaN(value) && value === parseFloat(filterValue);
                });
                break;
              case 'select':
                result = result.filter(row => row[field] === filterValue);
                break;
              case 'multiselect':
                result = result.filter(row => {
                  const rowValues = Array.isArray(row[field]) ? row[field] : [row[field]];
                  const filterValues = Array.isArray(filterValue) ? filterValue : [filterValue];
                  return filterValues.some(val => rowValues.includes(val));
                });
                break;
              case 'boolean':
                const boolValue = filterValue === 'true';
                result = result.filter(row => row[field] === boolValue);
                break;
              case 'date':
                result = result.filter(row => {
                  const rowDate = new Date(row[field]);
                  const filterDate = new Date(filterValue);
                  return rowDate.toDateString() === filterDate.toDateString();
                });
                break;
            }
          }
        }
      });

      // Apply global search
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(row => {
          return this.visibleColumns.some(column => {
            const value = row[column.field];
            if (value === null || value === undefined) return false;
            return value.toString().toLowerCase().includes(query);
          });
        });
      }

      // Apply sorting
      if (this.sortField) {
        result.sort((a, b) => {
          let aValue = a[this.sortField];
          let bValue = b[this.sortField];

          // Handle different data types
          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          } else if (aValue instanceof Date) {
            aValue = aValue.getTime();
            bValue = bValue.getTime();
          } else if (Array.isArray(aValue)) {
            aValue = aValue.join(',');
            bValue = bValue.join(',');
          }

          if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      return result;
    },

    // Paginated data for current page
    paginatedData() {
      if (!this.options.pagination) return this.filteredData;

      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;

      return this.filteredData.slice(start, end);
    },

    // Pagination info
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage);
    },

    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },

    endIndex() {
      return this.startIndex + this.itemsPerPage;
    },

    // Pages to display in pagination
    displayedPages() {
      const pages = [];
      const maxPages = 5;

      if (this.totalPages <= maxPages) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
        let endPage = startPage + maxPages - 1;

        if (endPage > this.totalPages) {
          endPage = this.totalPages;
          startPage = Math.max(1, endPage - maxPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
      }

      return pages;
    },

    // Visible columns
    visibleColumns() {
      if (this.visibleColumnIds.length === 0) {
        return this.columns;
      }

      return this.visibleColumnIds.map(i => this.columnsHashMap.get(i));
    }
  },
  watch: {
    data: {
      immediate: true,
      handler(newData) {
        this.localData = JSON.parse(JSON.stringify(newData));
      }
    },
    columns: {
      immediate: true,
      handler(newColumns) {
        this.onChangeColumns(newColumns);
      }
    },
    'options.itemsPerPage': {
      immediate: true,
      handler(newValue) {
        this.itemsPerPage = newValue;
      }
    }
  },
  mounted() {
    // Load saved state if available
    this.loadTableState();

    // Initialize sortable for draggable rows
    if (this.options.draggableRows) {
      this.initDraggableRows();
    }

    // Initialize sortable for draggable columns
    if (this.options.draggableColumns) {
      this.initDraggableColumns();
    }

    // Add event listener for column resizing
    if (this.options.resizableColumns) {
      document.addEventListener('mousemove', this.handleColumnResize);
      document.addEventListener('mouseup', this.stopColumnResize);
    }

    // Add event listener for click outside filter
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    // Remove event listeners
    if (this.options.resizableColumns) {
      document.removeEventListener('mousemove', this.handleColumnResize);
      document.removeEventListener('mouseup', this.stopColumnResize);
      document.removeEventListener('touchmove', this.handleTouchColumnResize);
      document.removeEventListener('touchend', this.stopTouchColumnResize);
    }

    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    // Update the startColumnResize method to handle both mouse and touch events
    startColumnResize(event, column) {
      // Prevent default browser behavior to avoid scrolling
      event.preventDefault();
      event.stopPropagation();

      this.resizingColumn = column;

      // Handle both mouse and touch events
      if (event.type === 'touchstart') {
        this.startX = event.touches[0].pageX;
      } else {
        this.startX = event.pageX;
      }

      this.startWidth = column.width;

      // For touch events, add touch-specific event listeners
      if (event.type === 'touchstart') {
        document.addEventListener('touchmove', this.handleTouchColumnResize, { passive: false });
        document.addEventListener('touchend', this.stopTouchColumnResize);
      }
    },

    // Add a touch-specific resize handler
    handleTouchColumnResize(event) {
      if (!this.resizingColumn) return;

      // Prevent default to stop scrolling
      event.preventDefault();

      const diff = event.touches[0].pageX - this.startX;
      const newWidth = Math.max(50, this.startWidth + diff);

      // Update column width
      const columnIndex = this.columns.findIndex(col => col.id === this.resizingColumn.id);
      if (columnIndex !== -1) {
        this.columns[columnIndex].width = newWidth;
      }
    },

    // Add a touch-specific stop resize handler
    stopTouchColumnResize() {
      this.resizingColumn = null;
      document.removeEventListener('touchmove', this.handleTouchColumnResize);
      document.removeEventListener('touchend', this.stopTouchColumnResize);
    },

    onChangeColumns(newColumns) {
      if (this.visibleColumnIds.length === 0) {
        this.visibleColumnIds = newColumns.map(col => col.id);
      }
      for (let i of newColumns) {
        this.columnsHashMap.set(i.id, i);
      }
      debug('Set columnsHashMap', this.columnsHashMap);
    },
    // Sorting
    sortBy(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortOrder = 'asc';
      }
    },

    // Filtering
    toggleFilter(columnId) {
      debug('toggleFilter clicked');
      this.activeFilter = this.activeFilter === columnId ? null : columnId;
    },

    updateFilter(field, value) {
      this.filters = {
        ...this.filters,
        [field]: value
      };
      this.currentPage = 1;
    },

    handleSearch: debounce(function () {
      this.currentPage = 1;
    }, 300),

    handleClickOutside(event) {
      debug('handleClickOutside clicked');
      if (this.activeFilter && !(event.target.closest('.data-grid-filter') || event.target.closest('.data-grid-filter-icon'))) {
        this.activeFilter = null;
      }
    },

    // Pagination
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    // Cell editing
    startEditing(row, column) {
      if (!column.editable || !this.options.editable) return;

      this.editingCell = {
        rowId: row.id,
        columnId: column.id,
        value: row[column.field]
      };
    },

    saveCell(value) {
      const rowIndex = this.localData.findIndex(row => row.id === this.editingCell.rowId);
      if (rowIndex === -1) return;

      const column = this.columns.find(col => col.id === this.editingCell.columnId);
      if (!column) return;

      // Update the data
      this.localData[rowIndex][column.field] = value;

      // Emit event
      this.$emit('row-updated', this.localData[rowIndex]);

      // Reset editing state
      this.cancelEditing();
    },

    cancelEditing() {
      this.editingCell = {
        rowId: null,
        columnId: null,
        value: null
      };
    },

    // Keyboard navigation
    handleKeyNavigation(event, rowIndex, columnId) {
      if (this.editingCell.rowId !== null) return;

      const columnIndex = this.visibleColumns.findIndex(col => col.id === columnId);
      if (columnIndex === -1) return;

      switch (event.key) {
        case 'ArrowUp':
          if (rowIndex > 0) {
            const prevRow = this.paginatedData[rowIndex - 1];
            const prevCell = document.querySelector(`[data-id="${prevRow.id}"] td:nth-child(${columnIndex + 1 + (this.options.treeView ? 1 : 0)})`);
            if (prevCell) {
              prevCell.focus();
            }
          }
          break;
        case 'ArrowDown':
          if (rowIndex < this.paginatedData.length - 1) {
            const nextRow = this.paginatedData[rowIndex + 1];
            const nextCell = document.querySelector(`[data-id="${nextRow.id}"] td:nth-child(${columnIndex + 1 + (this.options.treeView ? 1 : 0)})`);
            if (nextCell) {
              nextCell.focus();
            }
          }
          break;
        case 'ArrowLeft':
          if (columnIndex > 0) {
            const prevCell = document.querySelector(`[data-id="${this.paginatedData[rowIndex].id}"] td:nth-child(${columnIndex + (this.options.treeView ? 1 : 0)})`);
            if (prevCell) {
              prevCell.focus();
            }
          }
          break;
        case 'ArrowRight':
          if (columnIndex < this.visibleColumns.length - 1) {
            const nextCell = document.querySelector(`[data-id="${this.paginatedData[rowIndex].id}"] td:nth-child(${columnIndex + 2 + (this.options.treeView ? 1 : 0)})`);
            if (nextCell) {
              nextCell.focus();
            }
          }
          break;
        case 'Tab':
          // Tab key is handled by the browser
          break;
        case 'Enter':
          const column = this.visibleColumns[columnIndex];
          if (column.editable && this.options.editable) {
            this.startEditing(this.paginatedData[rowIndex], column);
          }
          break;
      }
    },

    // Column visibility
    updateVisibleColumns(columnIds) {
      this.visibleColumnIds = columnIds;
    },

    // Import/Export
    importData(data) {
      this.localData = data;
      this.showImportModal = false;
    },

    // Custom formula columns
    addFormulaColumn(formulaColumn) {
      // Add the new column to the columns array
      this.columns.push(formulaColumn);

      // Add the column to visible columns
      this.visibleColumnIds.push(formulaColumn.id);

      // Calculate values for all rows
      this.localData.forEach(row => {
        row[formulaColumn.field] = this.evaluateFormula(formulaColumn.formula, row);
      });
      this.onChangeColumns(this.columns);
    },

    evaluateFormula(formula, row) {
      try {
        // Replace column references with actual values
        const columns = this.columns;
        let evalFormula = formula;

        columns.forEach(col => {
          const regex = new RegExp(`\\[${col.field}\\]`, 'g');
          evalFormula = evalFormula.replace(regex, row[col.field] || 0);
        });

        // Evaluate the formula
        return eval(evalFormula);
      } catch (error) {
        console.error('Formula evaluation error:', error);
        return 'Error';
      }
    },

    // Tree view
    hasChildren(rowId) {
      return this.localData.some(row => row.parentId === rowId);
    },

    getChildRows(parentId) {
      return this.localData.filter(row => row.parentId === parentId);
    },

    toggleRowExpand(rowId) {
      const index = this.expandedRows.indexOf(rowId);
      if (index === -1) {
        this.expandedRows.push(rowId);
      } else {
        this.expandedRows.splice(index, 1);
      }
    },

    // Draggable rows
    initDraggableRows() {
      const tbody = document.querySelector('.data-grid-body');
      if (!tbody) return;

      Sortable.create(tbody, {
        handle: '.row-drag-handle',
        animation: 150,
        onEnd: (evt) => {
          // Update data order
          const movedItem = this.localData.splice(evt.oldIndex, 1)[0];
          this.localData.splice(evt.newIndex, 0, movedItem);
        }
      });
    },

    // Draggable columns
    initDraggableColumns() {
      const thead = document.querySelector('.data-grid-header tr');
      if (!thead) return;

      Sortable.create(thead, {
        handle: '.drag-handle',
        animation: 150,
        onEnd: (evt) => {
          // Get the old and new indices, accounting for tree view column if present
          const oldIndex = this.options.treeView ? evt.oldIndex - 2 : evt.oldIndex - 1;
          const newIndex = this.options.treeView ? evt.newIndex - 2 : evt.newIndex - 1;

          if (oldIndex < 0 || newIndex < 0 || oldIndex >= this.visibleColumnIds.length || newIndex >= this.visibleColumnIds.length) {
            return; // Skip if indices are out of bounds (e.g., dragging the tree view column)
          }
          // Update column order in visibleColumnIds
          const movedColumnId = this.visibleColumnIds.splice(oldIndex, 1)[0];
          this.visibleColumnIds.splice(newIndex, 0, movedColumnId);

          // Get the field names for the moved columns
          const movedColumn = this.columns.find(col => col.id === movedColumnId);
          if (!movedColumn) return;

          // No need to rearrange the actual data in the rows
          // The visibleColumns computed property already handles the column order
          // based on visibleColumnIds, which we've already updated above

          // We just need to force a re-render to reflect the new column order

          // Force a re-render
          this.$forceUpdate();
        }
      });
    },

    handleColumnResize(event) {
      if (!this.resizingColumn) return;

      const diff = event.pageX - this.startX;
      const newWidth = Math.max(50, this.startWidth + diff);

      // Update column width
      const columnIndex = this.columns.findIndex(col => col.id === this.resizingColumn.id);
      if (columnIndex !== -1) {
        this.columns[columnIndex].width = newWidth;
      }
    },

    stopColumnResize() {
      this.resizingColumn = null;
    },

    // Save/Load state
    saveTableState() {
      const state = {
        sortField: this.sortField,
        sortOrder: this.sortOrder,
        filters: this.filters,
        visibleColumnIds: this.visibleColumnIds,
        columns: this.columns.map(col => ({
          id: col.id,
          width: col.width
        })),
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        expandedRows: this.expandedRows
      };

      localStorage.setItem('dataGridState', JSON.stringify(state));
    },

    loadTableState() {
      try {
        const savedState = localStorage.getItem('dataGridState');
        if (!savedState) return;

        const state = JSON.parse(savedState);

        // Restore state
        this.sortField = state.sortField || '';
        this.sortOrder = state.sortOrder || 'asc';
        this.filters = state.filters || {};
        this.visibleColumnIds = state.visibleColumnIds || [];
        this.currentPage = state.currentPage || 1;
        this.itemsPerPage = state.itemsPerPage || this.options.itemsPerPage;
        this.expandedRows = state.expandedRows || [];

        // Restore column widths
        if (state.columns) {
          state.columns.forEach(stateCol => {
            const column = this.columns.find(col => col.id === stateCol.id);
            if (column) {
              column.width = stateCol.width;
            }
          });
        }
      } catch (error) {
        console.error('Error loading table state:', error);
      }
    }
  }
};
</script>
