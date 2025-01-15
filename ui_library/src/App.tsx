import React from "react";
import InfiniteScroller from "./components/scroller/InfiniteScroller";
import { FaReact } from "react-icons/fa";

const App: React.FC = () => {
  const items = [
    "Hello",
    <FaReact size={24} color="blue" />,
    "World",
    <img src="/image1.png" alt="Image 1" className="h-12" />,
    "Another text",
  ];

  return (
    <div className="w-screen h-screen bg-gray-900 flex justify-center items-center">
      <InfiniteScroller
        items={items}
        speed={80}                // px/s
        gap={30}                  // spacing in px
        direction="left"          // or 'right'
        pauseOnHover={true}       // pauses on hover
        className="h-20 bg-gray-200"
        itemClassName="px-2"      // extra styling for each item
      />
    </div>
  );
};

export default App;
