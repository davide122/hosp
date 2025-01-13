const BackgroundAnimations = () => {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500 to-pink-500 opacity-20 blur-3xl rounded-full animate-pulse"></div>
      </div>
    );
  };
  
  export default BackgroundAnimations;