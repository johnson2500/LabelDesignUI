import { useRef } from "preact/hooks";

type PromptInputProps = {
    classOverRide?: string;
    styleOverRide?: object;
    onPromptChange?: (value: string | undefined) => void;
    showFileInput?: boolean;
}

const FileInput = ({ classOverRide, styleOverRide, onPromptChange }: PromptInputProps) => {
    return (
        <input
            type="file"
            accept="image/*"
            class={classOverRide ? classOverRide : ""}
            style={styleOverRide ? { ...styleOverRide } : {}}
            onChange={(e: any) => {
                if (!onPromptChange) return;

                const file = e.target?.files?.[0];
                if (file) {
                    onPromptChange(file.name);
                } else {
                    onPromptChange(undefined);
                }
            }}
        />
    );
}

export function PromptInput({ classOverRide, styleOverRide, onPromptChange, showFileInput = false }: PromptInputProps) {
    return (
        <div>
            {showFileInput && (
                <FileInput
                    classOverRide={classOverRide}
                    styleOverRide={styleOverRide}
                    onPromptChange={onPromptChange}
                />
            )}
            <input
                type="text"
                placeholder="Enter your prompt here"
                class={classOverRide ? classOverRide : ""}
                style={styleOverRide ? { ...styleOverRide } : ""}
                onChange={(e: any) => {
                    if (!onPromptChange) return;

                    onPromptChange(e.target?.value || "");
                }}
            />
        </div>
    );
}