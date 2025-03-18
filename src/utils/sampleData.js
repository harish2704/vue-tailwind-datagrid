import { v4 as uuidv4 } from 'uuid';

// Generate random data for different types
const generateRandomName = () => {
  const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 'William', 'Emma', 'James', 'Olivia', 'Daniel', 'Sophia', 'Matthew', 'Ava', 'Joseph', 'Isabella', 'Christopher', 'Mia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson'];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateRandomEmail = (name) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'example.com'];
  const nameParts = name.toLowerCase().replace(' ', '.');
  return `${nameParts}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

const generateRandomDate = () => {
  const start = new Date(2020, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

const generateRandomAmount = () => {
  return (Math.random() * 10000).toFixed(2);
};

const generateRandomStatus = () => {
  const statuses = ['Active', 'Inactive', 'Pending', 'Completed', 'Cancelled'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const generateRandomBoolean = () => {
  return Math.random() > 0.5;
};

const generateRandomProgress = () => {
  return Math.floor(Math.random() * 101);
};

const generateRandomTags = () => {
  const allTags = ['Frontend', 'Backend', 'UI', 'UX', 'Database', 'API', 'Mobile', 'Web', 'Cloud', 'DevOps', 'Testing', 'Security'];
  const numTags = Math.floor(Math.random() * 3) + 1;
  const tags = [];
  
  for (let i = 0; i < numTags; i++) {
    const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
    if (!tags.includes(randomTag)) {
      tags.push(randomTag);
    }
  }
  
  return tags;
};

const generateRandomCountry = () => {
  const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia', 'Japan', 'China', 'India', 'Brazil'];
  return countries[Math.floor(Math.random() * countries.length)];
};

const generateRandomDepartment = () => {
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Customer Support', 'Research', 'Legal', 'Product'];
  return departments[Math.floor(Math.random() * departments.length)];
};

// Generate hierarchical data for tree view
const generateHierarchicalData = (parentId = null, level = 0, maxLevel = 2) => {
  if (level > maxLevel) return [];
  
  const items = [];
  const count = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const item = {
      id,
      parentId,
      name: generateRandomName(),
      department: generateRandomDepartment(),
      level
    };
    
    items.push(item);
    
    // Add children recursively
    if (Math.random() > 0.3) {
      const children = generateHierarchicalData(id, level + 1, maxLevel);
      items.push(...children);
    }
  }
  
  return items;
};

// Generate sample data
export const generateSampleData = (count = 100) => {
  const data = [];
  
  // Generate regular data
  for (let i = 0; i < count; i++) {
    const name = generateRandomName();
    const row = {
      id: uuidv4(),
      name,
      email: generateRandomEmail(name),
      date: generateRandomDate(),
      amount: generateRandomAmount(),
      status: generateRandomStatus(),
      isActive: generateRandomBoolean(),
      progress: generateRandomProgress(),
      tags: generateRandomTags(),
      country: generateRandomCountry(),
      department: generateRandomDepartment(),
      parentId: null
    };
    
    data.push(row);
  }
  
  // Add some hierarchical data
  const hierarchicalData = generateHierarchicalData();
  data.push(...hierarchicalData);
  
  return data;
};

// Generate columns configuration
export const generateColumns = () => {
  return [
    {
      id: 'name',
      label: 'Name',
      field: 'name',
      sortable: true,
      filterable: true,
      filterType: 'text',
      editable: true,
      width: 200,
      dataType: 'string'
    },
    {
      id: 'email',
      label: 'Email',
      field: 'email',
      sortable: true,
      filterable: true,
      filterType: 'text',
      editable: true,
      width: 250,
      dataType: 'string'
    },
    {
      id: 'date',
      label: 'Date',
      field: 'date',
      sortable: true,
      filterable: true,
      filterType: 'date',
      editable: true,
      width: 150,
      dataType: 'date'
    },
    {
      id: 'amount',
      label: 'Amount',
      field: 'amount',
      sortable: true,
      filterable: true,
      filterType: 'number',
      editable: true,
      width: 150,
      dataType: 'currency',
      format: {
        type: 'currency',
        currency: 'USD'
      }
    },
    {
      id: 'status',
      label: 'Status',
      field: 'status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: ['Active', 'Inactive', 'Pending', 'Completed', 'Cancelled'],
      editable: true,
      width: 150,
      dataType: 'enum'
    },
    {
      id: 'isActive',
      label: 'Active',
      field: 'isActive',
      sortable: true,
      filterable: true,
      filterType: 'boolean',
      editable: true,
      width: 100,
      dataType: 'boolean'
    },
    {
      id: 'progress',
      label: 'Progress',
      field: 'progress',
      sortable: true,
      filterable: true,
      filterType: 'number',
      editable: true,
      width: 150,
      dataType: 'percentage'
    },
    {
      id: 'tags',
      label: 'Tags',
      field: 'tags',
      sortable: false,
      filterable: true,
      filterType: 'multiselect',
      filterOptions: ['Frontend', 'Backend', 'UI', 'UX', 'Database', 'API', 'Mobile', 'Web', 'Cloud', 'DevOps', 'Testing', 'Security'],
      editable: true,
      width: 200,
      dataType: 'array'
    },
    {
      id: 'country',
      label: 'Country',
      field: 'country',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia', 'Japan', 'China', 'India', 'Brazil'],
      editable: true,
      width: 150,
      dataType: 'string'
    },
    {
      id: 'department',
      label: 'Department',
      field: 'department',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Customer Support', 'Research', 'Legal', 'Product'],
      editable: true,
      width: 200,
      dataType: 'string'
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      filterable: false,
      editable: false,
      width: 120,
      dataType: 'actions'
    }
  ];
};
