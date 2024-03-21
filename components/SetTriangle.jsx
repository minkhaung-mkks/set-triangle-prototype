import {useState,useEffect,useRef} from 'react'
import '../styles/SetTriangle.css'  

const SetTriangle = ({isZooming,opacity,position,setPosition,rotationDegrees,setRotationDegrees,lastAngleRef, setSetBoxRef}) => {
    const [isSelected, setIsSelected] = useState(false);
    const setBoxRef = useRef(null); 
    const [isRotating, setIsRotating] = useState(false);
    const imageRef = useRef(null);


    useEffect(() => {
      // Calculate and set original dimensions
      setSetBoxRef(setBoxRef)
  }, [setSetBoxRef]);

  
    const [isDragging, setIsDragging] = useState(false);

    const calculateAngle = (e) => {
      const rect = imageRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;
      return Math.atan2(y, x);
    };

    const dragMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation()
        setIsSelected(true)
        // Initial cursor positions
        let pos3 = e.clientX;
        let pos4 = e.clientY;
    
        // Update state to indicate dragging has started
        
    
        const elementDrag = (e) => {
        //   if (!isDragging) return;
        setIsDragging(true);
        setIsSelected(false)
          // Calculate new cursor position
          const pos1 = pos3 - e.clientX;
          const pos2 = pos4 - e.clientY;
    
          // Update the element's position
          // setBoxRef.current.style.top = (setBoxRef.current.offsetTop - pos2) + "px";
          // setBoxRef.current.style.left = (setBoxRef.current.offsetLeft - pos1) + "px";
    
          setPosition({y: (setBoxRef.current.offsetTop - pos2) + 'px',  x: (setBoxRef.current.offsetLeft  - pos1) + 'px'})
          // Set the new cursor positions for the next movement
          pos3 = e.clientX;
          pos4 = e.clientY;
        };
    
        const closeDragElement = () => {
          setIsDragging(false);
          setIsSelected(true)
          document.removeEventListener('mousemove', elementDrag);
          document.removeEventListener('mouseup', closeDragElement);
        };
    
        // Attach event listeners to the document
        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('mouseup', closeDragElement);

      };
    
      
    useEffect(() => {
      const rotateImage = (e) => {
        if (!isRotating) return;
        const angleNow = calculateAngle(e);
        let angleDelta = angleNow - lastAngleRef.current;
  
        // Normalize the angleDelta to handle the -180/180 jump
        if (angleDelta > Math.PI) {
          angleDelta -= 2 * Math.PI;
        } else if (angleDelta < -Math.PI) {
          angleDelta += 2 * Math.PI;
        }
  
        setRotationDegrees((prevDegrees) => prevDegrees + angleDelta * (180 / Math.PI)); // Convert radians to degrees
        lastAngleRef.current = angleNow; // Update the last angle
      };
      
      const stopRotation = () => {
        setIsRotating(false);
        setIsSelected(false)
        document.removeEventListener('mousemove', rotateImage);
        document.removeEventListener('mouseup', stopRotation);
      };
  
      if (isRotating) {
        document.addEventListener('mousemove', rotateImage);
        document.addEventListener('mouseup', stopRotation);
      }
  
      return () => {
        document.removeEventListener('mousemove', rotateImage);
        document.removeEventListener('mouseup', stopRotation);
      };
    }, [isRotating]);
    useEffect(() => {
        function handleClickOutside(event) {
          if (setBoxRef.current && !setBoxRef.current.contains(event.target)) {
            setIsSelected(false);
          }
        }
    
        // Only add the listener if the element is selected
        if (isSelected) {
          document.addEventListener("mousedown", handleClickOutside);
        }
    
        return () => {
          // Clean up the listener when the component unmounts or isSelected changes
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [isSelected]); 
      useEffect(() => {
        if(isZooming){
          setIsSelected(false)
        }
      }, [isZooming])
      
  return (
    <div className="set_box" 
    ref={setBoxRef}
    style={{
        border: isRotating ? '1px dotted black' : isSelected ? '1px solid blue' : 'none',
        borderRadius: isRotating ? '100%' : '0px',
        cursor: isSelected ? 'move' : 'pointer',
        position: 'absolute',
        left: `${position.x}`,
        top: `${position.y}`,
        pointerEvents: `${isZooming ? 'none' : 'auto'}`
      }}      
    onMouseDown={dragMouseDown}
    >
        <button className="rotate_btn upper_rotate"
          style={{display:`${isSelected ? 'block' : 'none'}`}} 
          onMouseDown={(e) => {
              e.stopPropagation(); 
              lastAngleRef.current = calculateAngle(e);
              setIsRotating(true);
            }}
        >
            <img src="rotate.png" alt="" className='rotate_btn_img'/>
        </button>
        <div className="drag_stopper"></div>
        <img draggable={false} onDragStart={(e)=>e.preventDefault()} ref={imageRef} src="Geodriehoek.png" alt="" className="set_triangle_img" 
         style={{ transform: `rotate(${rotationDegrees}deg)`, transition: 'transform 0.2s', opacity:opacity }}/>
    </div>
  )
}

export default SetTriangle