import { h } from 'preact';
import { Link } from 'preact-router';

export default function TopBar() {
    return (
        <nav class="bg-gray-800 text-white px-6 py-3 flex justify-between items-center shadow">
            <div class="text-xl font-semibold">AI Image</div>
            <div class="space-x-4">
                <a href="/" class="hover:underline text-gray-200">Home</a>
                <a href="/create" class="hover:underline text-gray-200">Create</a>
                <a href="/edit" class="hover:underline text-gray-200">Edit</a>
            </div>
        </nav>
    );
}