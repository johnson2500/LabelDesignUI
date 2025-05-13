import { useState } from 'preact/hooks';
import { ImageSearchRecolorTool } from './widgets/SearchAndRecolor';
import { ImageSearchReplaceTool } from './widgets/SearchAndReplace';

export function MultiWidgetDashboard() {
    const [activeIndex, setActiveIndex] = useState(0);

    const widgets = [
        { title: 'Search and Replace', content: <ImageSearchRecolorTool /> },
        { title: 'Search and Recolor', content: <ImageSearchReplaceTool /> },
    ];

    return (
        <div class="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h1 class="text-2xl font-bold mb-4 text-gray-800">Edit Selector</h1>

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
