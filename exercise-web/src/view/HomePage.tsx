import { useSpring, animated } from "@react-spring/web";

export function Homepage() {
  const [springs, api] = useSpring(() => ({

    from: { opacity: 0, x:5000 },
    to: {opacity: 1, x: 0}
  }));

  const handleClick = () => {
    api.start({
      from: { opacity:0 },
      to: {opacity:1}
    })
  }

  return (
    <animated.div onClick={handleClick} style={{ ...springs }} >
      <div className="text-center">
        <h1 className="text-7xl font-semibold ">Welcome to Exercise Generator</h1>
        <p className="text-xl">No bells and whistles. Just good old-fashioned workouts to help you stay healthy.</p>
      </div>
    </animated.div>
  );
}
