import { useSpring, animated } from "@react-spring/web";

export function Homepage() {
  const [springs, api] = useSpring(() => ({
    from: { x: 0 },
  }));

  const handleClick = () => {
    api.start({
      from: { x: 0 },
      to: {x:100}
    })
  }

  return (
    <animated.div onClick={handleClick} style={{...springs}}>
      <h1 className="text-2xl font-semibold ">Welcome to Exercise Generator</h1>
      <p>No bells and whistles. Just good old-fashioned workouts to help you stay healthy.</p>
    </animated.div>
  );
}
