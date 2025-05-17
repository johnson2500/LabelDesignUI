import { useState } from 'preact/hooks';

export function CreateWidgetSelector() {
  const [activeIndex, setActiveIndex] = useState(0);

  const widgets = [
    { title: 'Widget 1', content: <WidgetOne /> },
    { title: 'Widget 2', content: <WidgetTwo /> },
    { title: 'Widget 3', content: <WidgetThree /> },
    { title: 'Widget 4', content: <WidgetFour /> },
    { title: 'Widget 5', content: <WidgetFive /> },
  ];

  return (
    <div class="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 class="text-2xl font-bold mb-4 text-gray-800">Widget Dashboard</h1>

      <div class="flex space-x-2 mb-6">
        {widgets.map((widget, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            class={`px-4 py-2 text-sm font-medium rounded ${index === activeIndex
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {widget.title}
          </button>
        ))}
      </div>

      <div class="p-4 border rounded bg-gray-50">
        {widgets[activeIndex].content}
      </div>
    </div>
  );
}

// --- Dummy Widgets ---

function WidgetOne() {
  return <p>🧩 This is Widget One (e.g., Create Form)</p>;
}

function WidgetTwo() {
  return <p>📊 This is Widget Two (e.g., Data Visualizer)</p>;
}

function WidgetThree() {
  return <p>🖼️ This is Widget Three (e.g., Image Editor)</p>;
}

function WidgetFour() {
  return <p>⚙️ This is Widget Four (e.g., Settings)</p>;
}

function WidgetFive() {
  return <p>📁 This is Widget Five (e.g., File Manager)</p>;
}