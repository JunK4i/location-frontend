const Button = ({ onClick, text }) => {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 m-2 rounded w-56 h-full"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
