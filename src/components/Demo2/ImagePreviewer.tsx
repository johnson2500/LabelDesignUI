import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

type ImagePreviewProps = {
    url?: string;
    data: Buffer
    styleOverRide?: object;
    classOverRide?: string;
}

export function ImagePreview(props: ImagePreviewProps) {
    const getImageSource = (props: ImagePreviewProps) => {
        if (props.url) {
            return props.url;
        } else if (props.data) {
            return `data:image/png;base64,${Buffer.from(props.data).toString('base64')}`;
        } else {
            return "";
        }
    }

    return (
        <img
            src={getImageSource(props)}
            alt="Image Preview"
            style={props.styleOverRide ? { ...props.styleOverRide } : {}}
            class={props.classOverRide ? props.classOverRide : ""}
        />
    );
}
