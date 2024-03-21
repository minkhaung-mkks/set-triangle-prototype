import React, { useState, useEffect,useRef } from 'react';
import '../styles/CustomSlider.css';

const CustomSlider = ({ min, max, step, value, onChange }) => {
    const sliderRef = useRef(null);
    const [sliderValue, setSliderValue] = useState(value);
  
    useEffect(() => {
      setSliderValue(value);
    }, [value]);
  
    const handleMouseDown = (event) => {
      event.preventDefault();
      updateValue(event.clientX);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };
  
    const handleMouseMove = (event) => {
      event.preventDefault();
        updateValue(event.clientX);
    };
  
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  
    const updateValue = (clientX) => {
      const sliderRect = sliderRef.current.getBoundingClientRect();
      const relativeX = clientX - sliderRect.left;
      const percent = Math.min(1, Math.max(0, relativeX / sliderRect.width));
      const newValue = min + percent * (max - min);
      setSliderValue(newValue);
      onChange(newValue);
    };
  
    return (
      <div
        ref={sliderRef}
        className="custom-slider"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div
          className="slider-track"
          style={{ width: `${((sliderValue - min) / (max - min)) * 100}%` }}
        ></div>
        <div
          className="slider-thumb"
          style={{ left: `${((sliderValue - min) / (max - min)) * 100}%` }}
        ></div>
      </div>
    );
  };
  
  export default CustomSlider;