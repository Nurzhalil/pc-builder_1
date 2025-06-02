// API base URL
export const API_URL = 'http://localhost:3001/api';

// Component types
export const COMPONENT_TYPES = {
  CPU: 'cpus',
  GPU: 'gpus',
  MOTHERBOARD: 'motherboards',
  RAM: 'ram',
  STORAGE: 'storage',
  PSU: 'psu',
  CASE: 'cases',
  COOLER: 'coolers',
  MONITOR: 'monitors',
  KEYBOARD: 'keyboards',
  MOUSE: 'mice',
  HEADSET: 'headsets',
  SPEAKER: 'speakers',
  WEBCAM: 'webcams'
};

// Default image if component image is not available
export const DEFAULT_COMPONENT_IMAGE = 'https://images.pexels.com/photos/1432675/pexels-photo-1432675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

// PC Build purposes for auto-selection
export const BUILD_PURPOSES = [
  { id: 'office', name: 'Office/Work', description: 'For everyday office tasks, web browsing, and productivity' },
  { id: 'gaming', name: 'Gaming', description: 'For gaming performance with high FPS and graphics quality' },
  { id: 'content', name: 'Content Creation', description: 'For video editing, 3D rendering, and graphic design' },
  { id: 'budget', name: 'Budget', description: 'Best performance with minimal spending' },
  { id: 'compact', name: 'Compact Build', description: 'Small form factor for limited spaces' }
];

// Budget ranges
export const BUDGET_RANGES = [
  { id: 'budget', name: 'Budget', min: 0, max: 800 },
  { id: 'mid-range', name: 'Mid-Range', min: 801, max: 1500 },
  { id: 'high-end', name: 'High-End', min: 1501, max: 3000 },
  { id: 'extreme', name: 'Extreme', min: 3001, max: 10000 }
];

// Component form fields based on type
export const COMPONENT_FIELDS = {
  cpus: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'socket', type: 'text', label: 'Socket', required: true },
    { name: 'cores', type: 'number', label: 'Cores', required: true },
    { name: 'threads', type: 'number', label: 'Threads', required: true },
    { name: 'base_clock', type: 'number', label: 'Base Clock (GHz)', required: true },
    { name: 'boost_clock', type: 'number', label: 'Boost Clock (GHz)', required: true },
    { name: 'tdp', type: 'number', label: 'TDP (W)', required: true },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ],
  gpus: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'memory_size', type: 'number', label: 'Memory Size (GB)', required: true },
    { name: 'memory_type', type: 'text', label: 'Memory Type', required: true },
    { name: 'core_clock', type: 'number', label: 'Core Clock (MHz)', required: true },
    { name: 'boost_clock', type: 'number', label: 'Boost Clock (MHz)', required: true },
    { name: 'tdp', type: 'number', label: 'TDP (W)', required: true },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ],
  motherboards: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'socket', type: 'text', label: 'Socket', required: true },
    { name: 'chipset', type: 'text', label: 'Chipset', required: true },
    { name: 'form_factor', type: 'select', label: 'Form Factor', required: true, 
      options: ['ATX', 'Micro-ATX', 'Mini-ITX'] },
    { name: 'ram_slots', type: 'number', label: 'RAM Slots', required: true },
    { name: 'max_ram', type: 'number', label: 'Max RAM (GB)', required: true },
    { name: 'has_integrated_wifi', type: 'checkbox', label: 'Has Integrated WiFi' },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ],
  ram: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'capacity', type: 'number', label: 'Capacity (GB)', required: true },
    { name: 'type', type: 'text', label: 'Type', required: true },
    { name: 'speed', type: 'number', label: 'Speed (MHz)', required: true },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ],
  storage: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'type', type: 'select', label: 'Type', required: true,
      options: ['HDD', 'SSD', 'NVMe'] },
    { name: 'capacity', type: 'number', label: 'Capacity (GB)', required: true },
    { name: 'interface', type: 'text', label: 'Interface', required: true },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ],
  psu: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'power', type: 'number', label: 'Power (W)', required: true },
    { name: 'efficiency_rating', type: 'select', label: 'Efficiency Rating', required: true,
      options: ['80 Plus', '80 Plus Bronze', '80 Plus Gold', '80 Plus Platinum'] },
    { name: 'modular', type: 'checkbox', label: 'Modular' },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ],
  cases: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'form_factor', type: 'select', label: 'Form Factor', required: true,
      options: ['ATX', 'Micro-ATX', 'Mini-ITX'] },
    { name: 'max_gpu_length', type: 'number', label: 'Max GPU Length (mm)', required: true },
    { name: 'max_cooler_height', type: 'number', label: 'Max Cooler Height (mm)', required: true },
    { name: 'has_rgb', type: 'checkbox', label: 'Has RGB' },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ],
  coolers: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'type', type: 'select', label: 'Type', required: true,
      options: ['Air', 'Liquid'] },
    { name: 'socket', type: 'text', label: 'Socket', required: true },
    { name: 'tdp_supported', type: 'number', label: 'TDP Supported (W)', required: true },
    { name: 'fan_size', type: 'number', label: 'Fan Size (mm)', required: true },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ],
  monitors: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'screen_size', type: 'number', label: 'Screen Size (inches)', required: true },
    { name: 'resolution', type: 'text', label: 'Resolution', required: true },
    { name: 'refresh_rate', type: 'number', label: 'Refresh Rate (Hz)', required: true },
    { name: 'panel_type', type: 'select', label: 'Panel Type', required: true,
      options: ['TN', 'IPS', 'VA', 'OLED'] },
    { name: 'response_time', type: 'number', label: 'Response Time (ms)', required: true },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ],
  keyboards: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'type', type: 'select', label: 'Type', required: true,
      options: ['Mechanical', 'Membrane'] },
    { name: 'switch_type', type: 'text', label: 'Switch Type' },
    { name: 'layout', type: 'text', label: 'Layout', required: true },
    { name: 'backlight', type: 'checkbox', label: 'Has Backlight' },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ],
  mice: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'dpi', type: 'number', label: 'DPI', required: true },
    { name: 'buttons', type: 'number', label: 'Number of Buttons', required: true },
    { name: 'wireless', type: 'checkbox', label: 'Wireless' },
    { name: 'rgb', type: 'checkbox', label: 'Has RGB' },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ],
  headsets: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'type', type: 'select', label: 'Type', required: true,
      options: ['Wired', 'Wireless'] },
    { name: 'microphone', type: 'checkbox', label: 'Has Microphone' },
    { name: 'surround_sound', type: 'checkbox', label: 'Has Surround Sound' },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ],
  speakers: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'type', type: 'select', label: 'Type', required: true,
      options: ['2.0', '2.1', '5.1', '7.1'] },
    { name: 'total_watts', type: 'number', label: 'Total Watts', required: true },
    { name: 'bluetooth', type: 'checkbox', label: 'Has Bluetooth' },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ],
  webcams: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'resolution', type: 'text', label: 'Resolution', required: true },
    { name: 'fps', type: 'number', label: 'FPS', required: true },
    { name: 'microphone', type: 'checkbox', label: 'Has Microphone' },
    { name: 'autofocus', type: 'checkbox', label: 'Has Autofocus' },
    { name: 'price', type: 'number', label: 'Price', required: true }
  ]
};