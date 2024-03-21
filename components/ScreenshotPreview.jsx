import React, { useState } from 'react';
import html2canvas from 'html2canvas';

const ScreenshotPreview = () => {
    const [screenshot, setScreenshot] = useState(null);

    const captureScreen = async (event) => {
        const x = event.clientX;
        const y = event.clientY;

        const canvas = await html2canvas(document.body);
        const context = canvas.getContext('2d');

        // Assuming you want a 100x100 area around the cursor
        const startX = x - 50;
        const startY = y - 50;
        const width = 100;
        const height = 100;

        // Crop to the area around the mouse cursor
        const imageData = context.getImageData(startX, startY, width, height);
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = width;
        outputCanvas.height = height;
        const outputContext = outputCanvas.getContext('2d');
        outputContext.putImageData(imageData, 0, 0);

        // Convert to image and update state
        setScreenshot(outputCanvas.toDataURL());
    };

    return (
        <div onMouseMove={captureScreen} style={{ position: 'relative' }}>
            {/* Display the screen area */}
            {screenshot && <img src={screenshot} alt="Screenshot Preview" style={{ position: 'absolute', right: 0, top: 0 }} />}
        </div>
    );
};

export default ScreenshotPreview;
