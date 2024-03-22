import { useState, useRef,useEffect } from 'react';
import './App.css';
import SetTriangle from '../components/SetTriangle';
import domtoimage from 'dom-to-image';
import CustomSlider from '../components/CustomSlider';
function App() {
  const [showSetTriangle, setShowSetTriangle] = useState(false);
  const [screenshotURL, setScreenshotURL] = useState('');
  const angleExercisesImg = './angle_excerises.png';
  // State to hold the position of the square box
  const [boxPosition, setBoxPosition] = useState({ x: 0, y: 0 });
  // To hide the box on screenshot
  const [hidePreview, setHidePreview] = useState(false);

  const [isZooming,setIsZooming] = useState(false)
  const [loadingZoomedImage,setLoadingZoomedImage] = useState(false)
  const [opacity, setOpacity] = useState(1);
  const [position, setPosition] = useState({x: `50%`, y: `50%`}); // Position in percentage
  const problemBoxRef = useRef(null)
  const imgBoxRef = useRef(null)
  const [setBoxRef,setSetBoxRef]= useState(null)
  const lastAngleRef = useRef(0); // Store the last angle to detect large jumps
  const [rotationDegrees, setRotationDegrees] = useState(0);

  const [zoomMultipler,setZoomMultipler] = useState(1)

  const handleOpacityChange = (newValue) => {
    setOpacity(newValue);
  };

  useEffect(() => {
    // Function to update the position of the box
    const updateBoxPosition = (e) => {
      const problemBox = document.getElementById('problem_box');
      const rect = problemBox.getBoundingClientRect();
      const x = e.clientX - rect.left - 50; // Subtract half the size of the box to center it
      const y = e.clientY - rect.top - 50; // Subtract half the size of the box to center it
      setBoxPosition({ x, y });
    };

    // Get the problem_box and add an event listener
    const problemBox = document.getElementById('problem_box');
    problemBox.addEventListener('mousemove', updateBoxPosition);

    // Clean up the event listener on component unmount
    return () => {
      problemBox.removeEventListener('mousemove', updateBoxPosition);
    };
  }, []);
  const takeScreenshotAndCrop = (event,node) => {
    // Set the capture width and height
    const captureWidth = 400;
    const captureHeight = 400;
    const scale = 4; // Scale factor
    const originalWidth = node.offsetWidth;
    const originalHeight = node.offsetHeight;
    const imgBoxOriginalWidth = imgBoxRef.current.offsetWidth;
    const imgBoxOriginalHeight = imgBoxRef.current.offsetHeight;

    let setBoxOriginalWidth = 0;
    let setBoxOriginalHeight = 0;
    if(setBoxRef != null){
       setBoxOriginalWidth = setBoxRef.current.offsetWidth;
       setBoxOriginalHeight = setBoxRef.current.offsetHeight;
    }
    // Adjust the size of the div
    node.style.width = originalWidth * scale + "px";
    node.style.height = originalHeight * scale + "px";
    imgBoxRef.current.style.width = imgBoxOriginalWidth * scale + 'px'
    imgBoxRef.current.style.height = imgBoxOriginalHeight * scale + 'px'
    
    
    if(setBoxRef != null){
      setBoxRef.current.style.width = setBoxOriginalWidth * scale + "px";
      setBoxRef.current.style.height = setBoxOriginalHeight * scale + "px";
   }
    const rect = node.getBoundingClientRect();
    const scaleX = node.offsetWidth / rect.width;
    const scaleY = node.offsetHeight / rect.height;
    const cropX = (event.clientX - rect.left) * scaleX - (captureWidth / 2);
    const cropY = (event.clientY - rect.top) * scaleY - (captureHeight / 2);
    setHidePreview(true)
    setLoadingZoomedImage(true)
    domtoimage.toPng(node)
      .then((dataUrl) => {
        // Create an image element from the data URL
        const img = new Image();
        img.onload = () => {
         
          // Create a canvas to crop the image
          const canvas = document.createElement('canvas');
          canvas.width = captureWidth;
          canvas.height = captureHeight;
          const ctx = canvas.getContext('2d');
          // Calculate the crop position
          
  
          // Draw the cropped image onto the canvas
          ctx.drawImage(
            img,
            cropX , cropY , captureWidth, captureHeight, // Source rectangle
            0, 0, captureWidth, captureHeight // Destination rectangle
          );
          // Get the cropped image data URL
          const croppedDataUrl = canvas.toDataURL();
          // Do something with the cropped image data URL, like setting state
          setScreenshotURL(croppedDataUrl);
          setHidePreview(false)
          setLoadingZoomedImage(false)
           // Reset the size of the div
           node.style.width = originalWidth + "px";
           node.style.height = originalHeight + "px";
           imgBoxRef.current.style.width = imgBoxOriginalWidth + 'px'
           imgBoxRef.current.style.height = imgBoxOriginalHeight + 'px'
           
           if(setBoxRef != null){
            setBoxRef.current.style.width = setBoxOriginalWidth  + "px";
            setBoxRef.current.style.height = setBoxOriginalHeight  + "px";
           }
        };
        img.src=dataUrl
        
      })
      .catch((error) => {
        console.error('Failed to capture the screenshot', error);
      });
  };
  
  
  

  useEffect(() => {
    const node = problemBoxRef.current;
    const clickHandler = (event) => takeScreenshotAndCrop(event, node);

    if (isZooming) {
      node.addEventListener('click', clickHandler);
      setHidePreview(false);
    } else {
      setHidePreview(true);
      node.removeEventListener('click', clickHandler);
    }
    return () => {
      node.removeEventListener('click', clickHandler);
        
    };
  }, [isZooming,setBoxRef])


  
  return (
    <main className="web_page" style={{ display: 'flex',position:"relative", justifyContent: 'space-around', alignItems: 'center' }}>
      <div className="loading-spinner" style={{ display: `${loadingZoomedImage ? 'inline-block' : 'none'}`}}>
        <img src="./logo.png" alt="" className="logo" />
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
      < div id="problem_box" style={{cursor:`${hidePreview ? 'normal' : 'zoom'}`}} ref={problemBoxRef}>
        {/* Transparent preview box that follows the cursor */}
        <div
          style={{
            display:`${hidePreview ? "none" : 'block'}`,
            position: 'absolute',
            width: `${96 * zoomMultipler}px`,
            height:  `${96 * zoomMultipler}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            border: '2px solid red',
            pointerEvents: 'none', // Prevent the box from interfering with mouse events
            left: `${boxPosition.x}px`,
            top: `${boxPosition.y}px`,
            willChange: 'left, top', // Optimize for animations
          }}
        ></div>
        {/* Image on the left */}
          <div className="image_box" ref={imgBoxRef}>
            <img src={angleExercisesImg} alt="Angle Exercises" style={{ width: '100%', height: 'auto' }} />
          </div>

          {/* Conditional rendering of SetTriangle component */}
          {showSetTriangle && <SetTriangle isZooming={isZooming} opacity={opacity} position={position} setPosition={setPosition} rotationDegrees={rotationDegrees} setRotationDegrees={setRotationDegrees} lastAngleRef={lastAngleRef} setSetBoxRef={setSetBoxRef}/>}
          
      </div>
      

      {/* Button on the right */}
      <div className="right_side">
        <div className="preview_img_box">
          
            {screenshotURL && (
              <img src={screenshotURL} alt="Screenshot" style={{ width:"100%", objectFit:"contain"}} />
            )}
        </div>
        <button
          className={`menu_btn ${showSetTriangle ? "activated_btn": ""}`}
          onClick={() => {
            setShowSetTriangle(!showSetTriangle)
          }}
        >
          {showSetTriangle ? "Hide Set Triangle" : "Show Set Triangle"}  <img className='menu_icons' src="./Geodriehoek.png" alt="" />
        </button>
        {showSetTriangle && 
          <div draggable={false} onDragStart={(e)=>e.preventDefault()} style={{width:'70%'}}>
            <CustomSlider
                min={0}
                max={1}
                step={0.01}
                value={opacity}
                onChange={handleOpacityChange}
              />
              <div className="opacity-value" style={{color:'black'}}>Opacity: {opacity.toFixed(2)}</div>
          </div>
        }
        
        <button
           className={`menu_btn ${isZooming ? "activated_btn": ""}`}
          onClick={() => setIsZooming(!isZooming)}
        >
          Zoom <img className='menu_icons' src="./zoom.ico" alt="" />
        </button> 
      </div>


    </main>
  );
}

export default App