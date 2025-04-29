export function Spinner() {
    return (
        <svg class="animate-spin" width="36" height="36" viewBox="0 0 24 24">
            <circle
                cx="12" cy="12" r="10"
                stroke="#3498db"
                stroke-width="4"
                fill="none"
                stroke-dasharray="60"
                stroke-dashoffset="30"
            />
        </svg>
    );
}