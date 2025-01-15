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
      <p className="text-white">test</p>
      <InfiniteScroller
        items={items}
        speed={90}                // Vitesse en px/s
        gap={20}                  // Espace entre les items
        direction="right"         // Direction : 'left' ou 'right'
        pauseOnHover={true}       // Pause au survol
        className="h-20 bg-gray-200 w-full flex space-evenly"
        itemClassName="px-2 "      // Style individuel des items
      />
    </div>
  );
};

export default App;
